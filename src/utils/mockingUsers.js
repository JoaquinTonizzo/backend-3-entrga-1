import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const firstNames = ['Luna','Oliver','Milo','Lucas','Mateo','Sofía','Emma','Valentina','Isabella','Camila'];
const lastNames = ['García','Rodríguez','Martínez','López','Sánchez','Pérez','Gómez','Ruiz','Hernández','Fernández'];

const rand = (arr) => arr[Math.floor(Math.random()*arr.length)];

export async function generateUsers(count=1){
    if(!count||count<1) return [];
    const hashedPassword = await bcrypt.hash('coder123',10);

    const users = Array.from({length:count}).map((_,i)=>{
        const first = rand(firstNames);
        const last = rand(lastNames);
        const email = `${first}.${last}${i}@example.com`.toLowerCase();
        const role = Math.random() < 0.2 ? 'admin' : 'user';
        return {
            _id: mongoose.Types.ObjectId(),
            first_name: first,
            last_name: last,
            email,
            password: hashedPassword,
            role,
            pets: []
        }
    })
    return users;
}

export default {generateUsers};
