module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],   
  mode: 'jit',
  theme: {
    colors: {
      'white': '#ffffff',
      'black': '#000000',
      'primary': {
        100: '#F8FCFF',
        200: '#E5F4FF',
        400: '#A8DFFF',
        500: '#4B9ECD',
        600: '#24699D',
      },
      'setting': {
        500: '#8354BF',
        600: '#55298C',
      },
      'pins': {
        300: '#FFF8FA',
        400: '#FFE7EF',
        500: '#FF4F4F',
      },
      'category': {
        100: '#F5F9EB',
        200: '#EBFAE5',
        400: '#BDEB90',
        500: '#349E5F',
      },
      'grey': {
        100: '#ececec',
        300: '#8B8EA9',
        400: '#626583',
        500: '#223A69',
      },
      'error': {
        500: '#FE5E5E',
      },
      'menu': {
        500: '#8D9CD0',
        600: '#6D7EBA',
        700: '#4D5F9E',
      }
    },
  },
  plugins: [],
  variants: {
    extend: {}
  }
}