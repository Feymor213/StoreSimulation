/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1235283692")

  // remove field
  collection.fields.removeById("relation1856610630")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1235283692")

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1644553780",
    "hidden": false,
    "id": "relation1856610630",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "calendar",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
