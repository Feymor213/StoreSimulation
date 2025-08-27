/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2314344885")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3156365910",
    "hidden": false,
    "id": "relation989021800",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "categories",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2314344885")

  // remove field
  collection.fields.removeById("relation989021800")

  return app.save(collection)
})
