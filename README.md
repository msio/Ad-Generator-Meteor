# Ad-Generator

Ad-Generator generates `.html` Ad page from `.html` Template and Excel Data e.g. `.xls`. Generated Ad can be used e.g, in `iframe`.

## Example

This [example](http://www.screencast.com/t/MKjvyQhHZ) demostrates idea of the Ad-Generator.

## Setup

Ad-Generator is written in Meteor. First you need to have install [meteor](https://www.meteor.com/) for your OS.

* clone repo 
```shell 
npm install
```

### Set Paths
You have to configure paths where your templates, excel data and generated ads will be stored. Create new json file `settings-development.json` in the root directory and copy this content or `settings-example.json` into it.

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
`lagConfig` is configuration of meteor packages [alon:lag-methods](https://github.com/MasterAM/meteor-lag-methods) and [alon:lag-publications](https://github.com/MasterAM/meteor-lag-publications) where you can simulate response delay from server in development mode. If you don't put this config in `settings-development.json`, default delay will be 1000ms

Run App

```shell
npm start
```

If you want to simulate production on your machine (minified,concat ..)
```shell
npm run sim-production
```


