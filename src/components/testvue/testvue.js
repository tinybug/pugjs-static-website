import Vue from 'vue';
import testvueChild from './testvue.vue';

export default function (el) {
  new Vue({
    el: el,
    name: 'testvueMain',
    components: {
      testvueChild
    },
    mounted() {
      console.log('HELLO FROM VUE');
    },
    data() {
      return {
        list: ['aaa', 'bbb', 'ccc']
      }
    },
    methods: {
      clickaction(i) {
        console.log(i);
      }
    }
  });
}
