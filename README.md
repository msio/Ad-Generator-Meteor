# Ad Generator Meteor

Ad Generator generates `.html` Ad page from `.html` Template and Excel Data e.g. `.xls`. Generated Ad can be used e.g, in `iframe`.

## Example

This [example](http://www.screencast.com/t/MKjvyQhHZ) demostrates idea of the Ad Generator.

## Setup

Ad Generator is written in Meteor. First you need to have install [meteor](https://www.meteor.com/) for your OS.

* clone repo 
```shell 
npm install
```

### Set Paths
If you want to store your files on FS, you have to configure paths where your templates, excel data and generated ads will be stored. Create new json file `settings-development.json` in the root directory and copy this content or `settings-example.json` into it.

```json
{
  "private": {
    "adTemplatesPath": "path to templates",
    "adDataPath": "path to excel files",
    "generatedAdsPath": "path to generated ads"
  },
  "lagConfig": {
    "base": {
      "defaultDelay": 0
    }
  }
}
```
I recommend to use absolute path e.g. `Users/<username>/ad-generator-files/templates`  
If you want to store your files in a Cloud ,check the meteor package how to do it [Meteor-Files](https://github.com/VeliovGroup/Meteor-Files)

`lagConfig` is configuration of meteor packages [alon:lag-methods](https://github.com/MasterAM/meteor-lag-methods) and [alon:lag-publications](https://github.com/MasterAM/meteor-lag-publications) where you can simulate response delay from server in development mode. If you don't put this config in `settings-development.json`, default delay will be 1000ms

Run App

```shell
npm start
```

If you want to simulate production on your machine (minified,concat ..)
```shell
npm run sim-production
```
## Deployment

I recommend deploying Ad-Generator with [meteor-up](https://github.com/kadirahq/meteor-up). Because meteor-up uses docker, it is very import to set volume path from docker container to the host machine (your server)to able to see uploaded files on FS of the server. That will be done in config file  `mup.js` , that will be created after run `mup init`.
Also you have to set probably docker image to `abernix/meteord:base` but dont forget  to check if docker is installed on your server. Here is my example of this config file used on ubuntu
```js
module.exports = {
  servers: {
    one: {
      host: 'xxx.xxx.xxx.xxx',
      username: '<username>',
      // pem:
      password: '*****'
      // or leave blank for authenticate from ssh-agent
    }
  },

  meteor: {
    name: 'ad-generator',
    path: 'path to ad-generator',
    volumes: {
     // "/host/path": "/container/path"
     'home/<username>/ad-generator-files': 'home/<username>/ad-generator-files'
    },
    docker:{
     image: 'abernix/meteord:base'
    },
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
      debug: true
    },
    env: {
      ROOT_URL: 'http://xxx.xxx.xxx.xxx',
      MONGO_URL: 'mongodb://localhost/meteor'
    },
    deployCheckWaitTime: 60
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};
```


