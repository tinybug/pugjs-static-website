export default function run(selector, component) {
  const elements = document.querySelectorAll(selector);
  if (elements.length) {
    elements.forEach(item => {
      // item.dataset.initalized = 'true';
      component(item);
    });
  }
}
