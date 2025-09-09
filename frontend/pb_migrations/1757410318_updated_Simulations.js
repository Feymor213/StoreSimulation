/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2860454234")

  // remove field
  collection.fields.removeById("json1157109967")

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1157109967",
    "max": 0,
    "min": 0,
    "name": "inputData",
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
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json1157109967",
    "maxSize": 0,
    "name": "inputData",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("text1157109967")

  return app.save(collection)
})
