const path = require('path')

module.exports = {
  entry: './src/fathgrid.js',
  mode: 'production', // | 'development' | 'none'
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'FathGrid.js',
    library: {
      name: 'FathGrid',
      type: 'umd',
      export: 'default'
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
