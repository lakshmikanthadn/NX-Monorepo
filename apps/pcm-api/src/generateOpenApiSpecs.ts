import { OpenApiComponentV4 } from '@tandfgroup/pcm-entity-model-v4';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as swaggerJSDoc from 'swagger-jsdoc';

function generateSwagger() {
  const dir = 'dist/public/swagger';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }

  const apiVersions = [
    {
      source: './src/v4/**/*.ts',
      version: '4.0.x'
    },
    {
      source: './src/v410/**/*.ts',
      version: '4.1.x'
    }
  ];
  apiVersions.forEach((v) => {
    const swaggerOptions = {
      // Path to the API docs
      apis: [v.source, './src/doc/**/*.ts'],
      swaggerDefinition: {
        info: {
          title: `PCM-API-${v.version}`, // Title (required)
          version: v.version // Version (required)
        },
        openapi: '3.0.1',
        security: [
          {
            'Authorization-Header': []
          }
        ],
        // Specification (optional, defaults to swagger: '2.0')
        servers: [
          {
            description: 'DEV',
            url: 'https://api-dev.taylorfrancis.com/v4'
          },
          {
            description: 'QA',
            url: 'https://api-qa.taylorfrancis.com/v4'
          },
          {
            description: 'UAT',
            url: 'https://api-uat.taylorfrancis.com/v4'
          },
          {
            description: 'PROD',
            url: 'https://api.taylorfrancis.com/v4'
          }
        ]
      }
    };

    // Initialize swagger-jsdoc -> returns validated swagger spec in json format
    const swaggerSpec: any = swaggerJSDoc(swaggerOptions);

    swaggerSpec['components']['schemas'] = {
      ...swaggerSpec['components']['schemas'],
      ..._.get(OpenApiComponentV4, 'definitions', undefined)
    };
    let swaggerDoc = JSON.stringify(swaggerSpec);
    swaggerDoc = swaggerDoc.replace(/OpenApiSchema/g, '');
    swaggerDoc = swaggerDoc.replace(/definitions/g, 'components/schemas');
    fs.writeFileSync(`${dir}/${v.version}.json`, swaggerDoc);
  });
}

generateSwagger();
