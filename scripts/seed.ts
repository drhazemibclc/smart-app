// scripts/seed-simple.ts
import { auth } from '../src/server/auth';

async function main() {
  try {
    console.log('Starting seed...');

    // Check if user exists first
    const existingUser = await auth.api.listUsers({
      query: {
        searchField: 'email',
        searchValue: 'hazem032012@gmail.com'
      }
    });

    console.log('Existing users:', existingUser);

    // Create user if doesn't exist
    if (!existingUser || existingUser?.users?.length === 0) {
      const newUser = await auth.api.createUser({
        body: {
          email: 'hazem032012@gmail.com',
          password: 'HealthF24',
          name: 'Hazem',
          role: 'admin'
        }
      });
      console.log('User created:', newUser);
    } else {
      console.log('User already exists');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
