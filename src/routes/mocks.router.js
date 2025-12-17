import { Router } from 'express';
import mongoose from 'mongoose';
import { generateUsers } from '../utils/mockingUsers.js';
import { usersService, petsService } from '../services/index.js';

const router = Router();

const petNames = ['Rocky','Lola','Nala','Max','Bella','Coco','Jack','Maya','Toby','Lucy'];
const species = ['dog','cat','parrot','rabbit','hamster','turtle'];

const rand = (arr) => arr[Math.floor(Math.random()*arr.length)];

function generateMockPets(count=100){
    return Array.from({length:count}).map((_,i)=>({
        _id: mongoose.Types.ObjectId(),
        name: `${rand(petNames)}${i}`,
        specie: rand(species),
        birthDate: new Date(Date.now() - Math.floor(Math.random()*8*365)*24*3600*1000),
        adopted: false,
        owner: null,
        image: ''
    }))
}

// GET /api/mocks/mockingpets  (moved/implemented here)
router.get('/mockingpets', async(req,res)=>{
    const pets = generateMockPets(100);
    res.json({status:'success',payload:pets});
})

// GET /api/mocks/mockingusers
router.get('/mockingusers', async(req,res)=>{
    try{
        const users = await generateUsers(50);
        res.json({status:'success',payload:users});
    }catch(err){
        res.status(500).json({status:'error',error:err.message})
    }
})

// POST /api/mocks/generateData { users: number, pets: number }
router.post('/generateData', async(req,res)=>{
    try{
        const { users=0, pets=0 } = req.body;
        if(typeof users !== 'number' || typeof pets !== 'number') return res.status(400).json({status:'error',error:'users and pets must be numbers'});

        // Generate users and insert
        const usersMock = await generateUsers(users);
        const userInputs = usersMock.map(u=>({
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            password: u.password,
            role: u.role,
            pets: []
        }));

        const createdUsers = await Promise.all(userInputs.map(u=>usersService.create(u)));

        // Generate pets and assign owners randomly among created users
        const createdPets = [];
        for(let i=0;i<pets;i++){
            const name = `${rand(petNames)}${i}`;
            const specie = rand(species);
            const birthDate = new Date(Date.now() - Math.floor(Math.random()*8*365)*24*3600*1000);
            const owner = createdUsers.length ? createdUsers[Math.floor(Math.random()*createdUsers.length)] : null;
            const petInput = {
                name,
                specie,
                birthDate,
                owner: owner? owner._id : undefined
            }
            const createdPet = await petsService.create(petInput);
            createdPets.push(createdPet);

            // if has owner, update owner's pets array
            if(owner){
                const fullUser = await usersService.getUserById(owner._id);
                const updatedPets = Array.isArray(fullUser.pets)? fullUser.pets.slice() : [];
                updatedPets.push({_id: createdPet._id});
                await usersService.update(owner._id,{pets: updatedPets});
            }
        }

        res.json({status:'success',message:'Data generated',inserted:{users:createdUsers.length,pets:createdPets.length}})
    }catch(err){
        console.error(err);
        res.status(500).json({status:'error',error:err.message})
    }
})

export default router;
