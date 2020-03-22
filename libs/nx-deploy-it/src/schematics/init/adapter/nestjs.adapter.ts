import { BaseAdapter } from './base.adapter';
import { PROVIDER } from '../../../utils/provider';
import { prompt } from 'enquirer';
import { Rule, applyTemplates } from '@angular-devkit/schematics';
import { QUESTIONS } from '../../../utils/questions';
import { offsetFromRoot } from '@nrwl/workspace';

export class NestJSAdapter extends BaseAdapter {
  async extendOptionsByUserInput() {
    await super.extendOptionsByUserInput();
    const questions: any[] = [];

    if (
      this.options.provider === PROVIDER.GOOGLE_CLOUD_PLATFORM &&
      !this.options['gcp:region']
    ) {
      questions.push(QUESTIONS.gcpRegionCloudFunctions);
    }

    const anwsers = await prompt(questions);
    this.options = {
      ...this.options,
      ...anwsers
    };
  }

  addRequiredDependencies() {
    const dependencies = super.addRequiredDependencies();

    if (this.options.provider === PROVIDER.AZURE) {
      dependencies.push(
        {
          name: '@nestjs/azure-func-http',
          version: '^0.4.2'
        },
        {
          name: '@azure/functions',
          version: '^1.2.0'
        }
      );
    }
    if (this.options.provider === PROVIDER.AWS) {
      dependencies.push({
        name: 'aws-serverless-express',
        version: '^3.3.6'
      });
    }
    return dependencies;
  }

  getApplicationTypeTemplate(): Rule {
    return applyTemplates({
      rootDir: 'src',
      getRootDirectory: () => 'src',
      stripTsExtension: (s: string) => s.replace(/\.ts$/, ''),
      getRootModuleName: () => 'AppModule',
      getRootModulePath: () => 'app/app.module',
      projectName: this.options.project,
      offsetFromRoot: offsetFromRoot(this.project.root)
    });
  }

  getDeployActionConfiguration(): any {
    const config = super.getDeployActionConfiguration();

    // TODO: use in deploy & destroy via angular.json config
    // if (options.provider === PROVIDER.GOOGLE_CLOUD_PLATFORM && options.region) {
    //   args.push('-c', `gcp:region=${options.region}`);
    // }

    return config;
  }

  getDestroyActionConfiguration(): any {
    const config = super.getDestroyActionConfiguration();
    return config;
  }
}