const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

const bannerPlugin = new webpack.BannerPlugin({
  banner: '// { "framework": "Vue" }\n\n',
  raw: true
})

const entry = {}

// Read all `.vue` files in dir, and add to the entry object
const excludePaths = ['build', 'components', 'node_modules']
function walk (dir, parentFolder = '') {
  const directory = dir || path.join(__dirname, 'examples')
  fs.readdirSync(directory).forEach(file => {
    const filePath = path.join(directory, file)
    const stat = fs.statSync(filePath)
    const extname = path.extname(filePath)
    if (stat.isFile() && extname === '.vue') {
      const name = path.join(parentFolder, path.basename(file, extname))
      entry[name] = path.resolve(__dirname, filePath) + '?entry=true'
    } else if (stat.isDirectory() && excludePaths.indexOf(file) === -1) {
      walk(path.join(directory, file), file)
    }
  })
}

walk('examples')

module.exports =  {
  entry,
  output: {
    path: path.resolve(__dirname, 'examples/build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      }, {
        test: /\.vue(\?[^?]+)?$/,
        use: ['weex-loader']
      }
    ]
  },
  plugins: [bannerPlugin]
}
