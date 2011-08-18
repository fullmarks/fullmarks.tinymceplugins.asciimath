# coding=utf-8

from setuptools import setup, find_packages
import os

version = '1.2'

setup(name='fullmarks.tinymceplugins.asciimath',
      version=version,
      description="TinyMCE ASCIIMATH Plugin for Plone",
      long_description=open("README.rst").read() + "\n" +
                       open(os.path.join("docs", "HISTORY.txt")).read(),
      # Get more strings from
      # http://pypi.python.org/pypi?:action=list_classifiers
      classifiers=[
        "Framework :: Plone",
        "Programming Language :: Python",
        ],
      keywords='plone math asciimath mathml tinymce',
      author='Roché Compaan',
      author_email='roche@upfrontsystems.co.za',
      url='http://github.com/fullmarks',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['fullmarks', 'fullmarks.tinymceplugins'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          # -*- Extra requirements: -*-
          'fullmarks.mathjax',
      ],
      entry_points="""
      # -*- Entry points: -*-
      [z3c.autoinclude.plugin]
      target = plone
      """,
      )
