import 'module-alias/register';
import { connectMongoDB, disconnectMongoDB } from '@/config/mongodb';
import {glob } from 'glob';
import path from 'path';
import { Migrations } from '@/models/migration.model';

async function migrate(): Promise<void> {
  try {
    await connectMongoDB();

    const migratedFile = await Migrations.find();
    const migratedFileArray = migratedFile.map(e => e.file);
    
    const pattern = path.resolve(__dirname, '../migrations/*.migration.ts');
    const files = (await glob(pattern)).sort();
   
    if (files.length) {
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i].split('/').at(-1);
        if (migratedFileArray.includes(fileName as string)) {
          continue;
        }
        const migration = await import(files[i]);
        await migration.migrate();
        await Migrations.create({ file: fileName });
      }
    } else {
      console.log('No module imported');
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await disconnectMongoDB();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
}); 