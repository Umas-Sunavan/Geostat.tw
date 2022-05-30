import {writeFile} from 'fs';

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
   production: true,
   firebaseConfig: {
      apiKey: "${process.env['API_KEY']}",
      authDomain: "${process.env['AUTH_DOMAIN']}",
      databaseURL: "${process.env['DATABASE_URL']}",
      projectId: "${process.env['PROJECT_ID']}",
      storageBucket: "${process.env['STORAGE_BUCKET']}",
      messagingSenderId: "${process.env['MESSAGING_SENDER_ID']}",
      appId: "${process.env['APP_ID']}",
      measurementId: "${process.env['MEASUREMENT_ID']}"
    },
};
`;

writeFile(targetPath, envConfigFile, 'utf8', (err) => {
  if (err) {
    return console.log(err);
  }
});