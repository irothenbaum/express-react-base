const {TwingEnvironment, TwingLoaderFilesystem} = require('twing');
let loader = new TwingLoaderFilesystem('./views');
let twing = new TwingEnvironment(loader);

const TwigRender = function(res, template, params) {
    params = params || {}
    res.send(twing.render(template + '.twig', {...res.locals, ...params}))
}

module.exports = TwigRender