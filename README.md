# Main projects within this project

- Database explorer (SVG)
- Be able to write and execute queries, interpret SQL syntax, respond with data in table
- Mutations on data and removal of data
- cluster fields on detail page based on descriptive properties in the db ([1.1] etc)
- ability to show graph on view with vue-morris https://github.com/bbonnin/vue-morris and raphaeljs https://dmitrybaranovskiy.github.io/raphael/
- nullify relations in the importer when they are empty
- log-in screen where the database credentials can be provided, and database is selected in dropdown when credentials are provided
- user based access based on actual database users
- write a code editor with e.g. https://codemirror.net/ to be able to write queries
- have a schema definition for the configuration
- user management
- creation of tables
- creation of tables with AI based on a case
- single line creation and removal in a table (small tables like todo)
- Theme params
- API models 
- Audit trail
- generated automatic swagger definitions for auto-generated API's
  - Versioning for these definitions
- able to generate a PDF for a detail page of a queryable
  - use https://stackoverflow.com/questions/70078596/ how-to-convert-component-string-as-real-component-in-vue to load templates from the config
  - generate the PDF with https://sidebase.io/nuxt-pdf/getting-started/quick-start

## queryables
- v able to rename a queryable to what you want it to look like within the GUI
- v configure an icon that represents the queryable for the user
- v enable the user to create quick-links on their homepage
- v show how many records relate to a parent record in the listing
- v prevent deleting when there is a relation and the relation restricts the delete of the record
- v automatically show the most valuable details of a related record
- v enable the user to click further from this queryable to the detailed page of a related record
- v automatically determine how to represent a record based on the most prominent features of the related queryable
- v overrule how to represent records of a queryable by config
- v Quick links to tables by clicking an icon in the main navigation bar of an overview
- be able to rename a column title
- have bulk actions in the overview
  - delete
  - set a certain value to a certain state
- Have a default importer ready for any queryable source
- Show which importers are applicable to a queryable source
- group columns in column selecter per window on detailpage


## records
- v depending on the column configuration, show a different way of editing the value
- v numbers
- v fields that reference a different table automatically show the most priminent details of that record
- v date-time fields 
- v date-time fields can look to one another when a date-range is intended
- v you can search a referenced queryable for their records by the most prominent details of their records
- extra field in database used for meta description
  - D\[1,1] = means Detailpage, window 1, position 1

## translations
- enable the user to rename *everything*
  - gui elements
  - queryable names
  - amend a text that serves as an introduction on the queryable page
  - column names

## migrations
- v configure an importer
  - v deepen a relation and auto-relate the information to a deeper table
  - v visualise how these connections came to be
  - v visualise how these 
- v export any queryable to a CSV file
- reverse an importer to export it in exactly the same format

## complexity
- v abstract away all complexity, but show it when the user wants to
  - v detailed config analysis
  - v detailed migration analysis
  - v details per field in the gui
