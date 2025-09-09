/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2860454234")

  // remove field
  collection.fields.removeById("json3323504492")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3323504492",
    "max": 0,
    "min": 0,
    "name": "outputData",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2860454234")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json3323504492",
    "maxSize": 0,
    "name": "outputData",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("text3323504492")

  return app.save(collection)
})
