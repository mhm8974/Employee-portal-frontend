const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '../.env');
const targetPath = path.join(__dirname, '../src/environments/environment.ts');

try {
    if (!fs.existsSync(envFilePath)) {
        console.error('.env file not found at ' + envFilePath);
        process.exit(1);
    }

    const envFileContent = fs.readFileSync(envFilePath, 'utf8');
    const lines = envFileContent.split('\n');
    const envVars = {};

    lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const trimmedKey = key.trim();
            let value = valueParts.join('=').trim();
            value = value.replace(/;$/, '').trim();
            if ((value.startsWith("'") && value.endsWith("'")) ||
                (value.startsWith('"') && value.endsWith('"'))) {
                value = value.substring(1, value.length - 1);
            }
            envVars[trimmedKey] = value;
        }
    });

    const apiUrl = envVars['API_URL'] || 'http://localhost:8000/api';
    const msg91WidgetId = envVars['MSG91_WIDGET_ID'] || '';
    const msg91AuthToken = envVars['MSG91_AUTH_TOKEN'] || '';

    
    const fileContent = `export const environment = {
  production: false,
  apiUrl: '${apiUrl}',
  msg91WidgetId: '${msg91WidgetId}',
  msg91AuthToken: '${msg91AuthToken}'
};
`;

    fs.writeFileSync(targetPath, fileContent);
    console.log('SUCCESS: Generated environment.ts');
} catch (error) {
    console.error('FAILED to generate environment.ts:', error);
    process.exit(1);
}
