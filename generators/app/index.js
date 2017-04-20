'use strict';
const chalk = require('chalk');
const Generator = require('yeoman-generator');
const yosay = require('yosay');

const basicPrompts = [
  {
    message: 'What is the name of the contained npm package?',
    name: 'containedPackageName',
    type: 'string'
  },
  {
    message: 'What is the name of your package on npm?',
    name: 'npmName',
    type: 'string'
  },
  {
    message: 'What is your NuGet package and GitHub repository name?',
    name: 'nugetName',
    type: 'string'
  },
  {
    message: 'What is your general description?',
    name: 'description',
    type: 'string'
  },
  {
    message: 'What is your name?',
    name: 'author',
    type: 'string'
  },
  {
    message: 'What is your GitHub user or organization name?',
    name: 'githubUser',
    type: 'string',
  },
  {
    default: 'lib/cli.js',
    message: 'What is the file path of the CLI launcher for the contained package?',
    name: 'cliLauncher',
    type: 'string'
  },
  {
    message: 'What is the name of your target?',
    name: 'targetName',
    type: 'string'
  },
  {
    message: 'What MSBuild target should this run after?',
    name: 'targetAfterTargets',
    type: 'string'
  },
  {
    message: 'What does your MSBuild target take as inputs?',
    name: 'targetInputs',
    type: 'string'
  }
];

module.exports = class extends Generator {
  async prompting() {
    const basicProps = await this.prompt(basicPrompts);
    const targetOptions = await this._promptForTargetOptions();

    this.props = Object.assign({}, basicProps, { targetOptions });
  }

  async _promptForTargetOptions() {
    const { type } = await this.prompt({
      default: 'n',
      message: 'Would you like to add an (i)tem or (p)roperty, or (n)o?',
      name: 'type',
      type: 'string'
    });
    const choice = type
      ? type[0].toLowerCase()
      : '';

    switch (choice) {
      case 'i':
        return [
          await this._promptForTargetOption('item'),
          ...(await this._promptForTargetOptions())
        ];

      case 'n':
        return [];

      case 'p':
        return [
          await this._promptForTargetOption('property'),
          ...(await this._promptForTargetOptions())
        ];

      default:
        this.log('Sorry, what was that?');
        return this._promptForTargetOptions();
    }
  }

  async _promptForTargetOption(optionType) {
    const { name } = await this.prompt({
      message: `What is the ${optionType} name?`,
      name: 'name',
      type: 'string'
    });

    const { flag } = await this.prompt({
      message: `What is the CLI flag for ${name}?`,
      name: 'flag',
      type: 'string'
    });

    const { dataType } = await this.prompt({
      choices: ['array', 'number', 'string'],
      message: `What is the data type of ${name}?`,
      name: 'dataType',
      type: 'string'
    });

    const { defaultValue } = await this.prompt({
      message: `What is the default value of ${name}?`,
      name: 'defaultValue',
      type: 'string'
    });

    console.log({ defaultValue, flag, name, optionType });
    return { defaultValue, flag, name, optionType };
  }

  writing() {
    this.fs.copy(
      this.templatePath('./static/**/*'),
      this.destinationPath('.'));
    this.fs.copyTpl(
      this.templatePath('./templated/**/*'),
      this.destinationPath('.'),
      this.props);
    this.fs.copyTpl(
      this.templatePath('./renamed/package.nuspec'),
      this.destinationPath(this.props.nugetName + '.nuspec'),
      this.props);
    this.fs.copyTpl(
      this.templatePath('./renamed/src/build/package.targets'),
      this.destinationPath(this.props.nugetName + '.targets'),
      this.props);
  }

  install() {
    this.log('Running ' + chalk.yellow('npm install') + '....');
    // this.npmInstall();
  }
};
