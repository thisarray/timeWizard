const timeWizard = (function () {
  return {
    main() {
      for (const element of document.querySelectorAll('time')) {
        console.log(element.getAttribute('datetime'));
      }
    }
  }
})();
