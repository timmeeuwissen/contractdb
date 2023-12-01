<template lang="pug">
v-card.px-2.mx-2(
  v-for="info, index in data" :key="index"
)
  v-card-title {{ info.title }}
  v-card-text
    v-row
      v-col(
        cols="4"
        :order="index % 2 ? 'last' : 'first'"
      )
        v-parallax(
          height="200px"
          :src="info.img"
        )
      v-col(cols="8") {{ info.text }}
</template>
<script setup>
const data = [
  {
    img: '/david-pupaza-Q9-QEy1_jYI-unsplash.jpg',
    title: 'Automated backend for your services',
    text: 'Unwilling or able to invest in writing the management systems behind your services? ' +
      'We\'ve got you! Either directly connect to a MySQL database, or connect T.I.M over API to your ' +
      'services to ingest, transform and publish your data. '
  },
  {
    img: '/benjamin-lehman-GNyjCePVRs8-unsplash.jpg',
    title: 'Keep data where it belongs, with you',
    text: 'Don\'t want anyone to have your data? We don\'t! You connect with database credentials straight ' +
      ' to your database and we do the rest! There is no development, no waiting, no configuring needed. ' +
      ' our systems connect to your datastorage, and interpret the structure your database already provides. ' +
      ' As long as you are using MySQL, we will understand how your data is structured and immediately ' +
      ' provide you with a GUI that makes sense. '
  },
  {
    img: '/resource-database-F_z2cHsOXnM-unsplash.jpg',
    title: 'No more systems that dictate your way of working needed',
    text: 'Such a horror to buy a system and miss that one field and having to invest large amounts of ' +
      ' "consultancy" hours to change the system. With T.I.M, you change your table definition, and ' +
      ' it\'s done!. It\'s YOUR data, and YOU should be able to work with it the way that suits YOU best. '
  },
  {
    img: '/thomas-le-pRJhn4MbsMM-unsplash.jpg',
    title: 'Pick and choose what you need',
    text: 'In order to be most effective, we enable you to expand your database with battle-proven ' +
      ' datastructures. Have a CRM, but want to store contracts as well? Just go to the marketplace ' +
      ' , click "add contract management" and see your abilities grow! '
  },
  {
    img: '/manahil-manstashah-4pdahuUVGZs-unsplash.jpg',
    title: 'Connect your data from any system, to any system',
    text: 'One of T.I.M\'s most unique features is that you can connect your database in many ways. ' +
      ' I.e. you can pick any flat csv file and import it into your layered datastructure. And do the  ' +
      ' same thing in reverse. We make it easy to connect to a random data-source, take that data and ' +
      ' store it in your database, or the other way around by generating API\'s, webhooks, API contracts ' +
      ' in many formats. '
  },
  
]
</script>