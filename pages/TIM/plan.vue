<template lang="pug">
v-radio-group(
  v-model="planStore.paidPlan"
)
  v-row
    v-col(cols="6")
      v-card
        v-card-title Free Plan
          v-list(lines="two")
            v-list-item(
              v-for="prop, index in plans"
              :key="index"
              :title="prop.title"
              :subtitle="prop.free_description || prop.description"
              :prepend-icon="prop.icon"
              :class="prop.free_classes"
            )
          v-radio.mx-2(
            :value="false"
            name="paidPlan"
            color="primary"
            label="Stick with free plan"
          )
    v-col(cols="6")
      v-card
        v-card-title Paid Plan
          v-list(lines="two")
            v-list-item(
              v-for="prop, index in plans"
              :key="index"
              :title="prop.title"
              :subtitle="prop.paid_description || prop.description"
              :prepend-icon="prop.icon"
              :class="prop.paid_classes"
            )
          v-radio.mx-2(
            color="primary"
            name="paidPlan"
            :value="true"
            label="Level up!"
          )

v-card(v-if="planStore.paidPlan")
  v-card-title Feature toggles
  v-card-text
    p Here you can select which features you require in your system.
    v-card(
      v-for="toggle in feature_toggles"
    )
      v-card-title 
        v-switch.mr-3(
          v-model="toggle.model"
          hide-details="true"
          color="primary"
          :label="toggle.label"
        ) 
      v-card-text {{ toggle.description }}
    

</template>
<script setup>
import { usePlanStore } from '~/stores/plan';

const planStore = usePlanStore()

const plans = [
  { 
    free_classes: 'bg-warning',
    paid_classes: 'bg-success',
    icon: 'mdi-knob',
    title: 'Volume',
    free_description: '1 server, 1 database, 10 tables, 5000 records',
    paid_description: '1 server, Unlimited databases, tables and records',
  },
  {
    free_classes: 'bg-warning',
    paid_classes: 'bg-success',
    icon: 'mdi-database-export-outline',
    title: 'Import and Export your data',
    free_description: 'Each table can be imported and exported',
    paid_description: 'Enables features to import from and to multiple formats',
  },
  {
    free_classes: 'bg-error',
    paid_classes: 'bg-success',
    icon: 'mdi-cloud-upload-outline',
    title: 'Backup your data',
    free_description: 'Sorry, your database, your backup',
    paid_description: 'Automated backups and backup management',
  },
  {
    free_classes: 'bg-error',
    paid_classes: 'bg-success',
    icon: 'mdi-connection',
    title: 'Features',
    free_description: 'What you have, is what you get',
    paid_description: 'Access to features like Graphs, Audit trail, Migrations, API management, Translations, and much more',
  }
]


const feature_toggles = [
{
    model: planStore.auditTrail,
    label: 'System Wide (persistant) Audit Trail',
    description: 'Register all changes you\'ve made to your data. If you want to, you can ' +
        ' also store the information in your database. If you are alone and have no ' +
        ' need for a persistant audit trail, you won\'t need this. '
  },
  {
    model: planStore.config,
    label: 'Configure',
    description: ' Understand your configuration. In case there is a config file defined for you,' +
        ' you can exactly see what the config represents. You can also analyse and mutate ' +
        ' how records of tables are represented within the system. You can also do this ' +
        ' without the config editor, simply by creating a UNIQUE constraint on your table.' +
        ' The biggest constraint will automatically be used for the representation of a record.' 
  },
  {
    model: planStore.query,
    label: 'Query',
    description: ' Write your own queries and work with the data. After query execution ' +
        ' you will be able to create a view from the query, export its data, or analyse its output. ' 
  },
  {
    model: planStore.databaseManagement,
    label: 'Database Management',
    description: ' Manage your database, visually. No other tools needed! ' +
        ' Makes sense to use the query browser as well if you use this feature.' +
        ' Both have a tight integration.' 
  },
  {
    model: planStore.migrations,
    label: 'Migrations',
    description: ' Manage custom migrations from and to your database. ' +
        ' Each defined importer is imnmediately an exporter and vice-versa' 
  },
  {
    model: planStore.graphs,
    label: 'Graphs',
    description: ' Pick a view, and plot it on your screen. The Graphs feature allows  ' +
        ' the user to visually understand what the data is about. As a matter of fact, ' +
        ' we use it ourselves as well to show you the financial trends on our system! ' 
  },
  {
    model: planStore.translations,
    label: 'Translations',
    description: ' Every spoken word within the system is managed by an internationalization system.' +
        ' And even better, every word witin your data definitions as well! Translate your ' +
        ' columns to each language you want, or remain within the same language and provide ' +
        ' an esthetically more appealing name.' 
  },
  {
    model: planStore.APIs,
    label: 'API Management',
    description: ' Make your systems accessible for other systems by providing API\'s to your tables.' +
        ' You can manage webhooks, automated versioning of your endpoints and configure ' +
        ' adapter-logic from and towards your database, or as a passthrough. Strong stuff!' 
  },
  {
    model: planStore.access,
    label: 'Access Management',
    description: ' We do not store any user specific information, since all information is derived ' +
        ' from your database. However, your database also has usermanagement embedded. We ' +
        ' provide a powerfull interface to explore what users can see when they log in, or  ' +
        ' what external systems can see when they connect to your API\'s in example.  ' +
        ' All based on your own database! '
  },
]

</script>