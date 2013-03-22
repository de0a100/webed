__author__ = 'hsk81'

###############################################################################
###############################################################################

from flask.ext.assets import Environment, Bundle
from webassets.loaders import YAMLLoader

from ..app import app

###############################################################################
###############################################################################

loader = YAMLLoader (app.config['YML_FILE'])
bundles = loader.load_bundles ()

assets = Environment(app)
assets.register (bundles)

###############################################################################
###############################################################################