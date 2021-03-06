// import { expect } from 'chai';
import * as path from 'path';
import * as fs from 'fs';
import { Cpass } from 'cpass';

import { ISPPullOptions, ISPPullContext, Download } from '../../src/SPPull';
const sppull = new Download().sppull;
const cpass = new Cpass();

import { deleteFolderRecursive } from '../utils/utils';
import { TestsConfigs } from '../configs';

for (const testConfig of TestsConfigs) {

  describe(`Run tests in ${testConfig.environmentName}`, () => {

    let context: ISPPullContext;

    before('Configure', function(done: any): void {
      this.timeout(30 * 1000);
      const { siteUrl, ...creds } = require(path.resolve(testConfig.configPath));
      creds.password = creds.password && cpass.decode(creds.password);
      context = { siteUrl, creds };
      deleteFolderRecursive(testConfig.dlRootFolder);
      done();
    });

    it(`should pull in basic mode`, function(done: MochaDone): void {
      this.timeout(300 * 1000);

      const options: ISPPullOptions = {
        spRootFolder: testConfig.spRootFolder,
        dlRootFolder: path.join(testConfig.dlRootFolder, 'basic'),
        muteConsole: true
      };

      sppull(context, options).then(_ => done()).catch(done);
    });

    it(`should pull in strict mode`, function(done: MochaDone): void {
      this.timeout(300 * 1000);

      const options: ISPPullOptions = {
        spRootFolder: '_catalogs/masterpage',
        dlRootFolder: path.join(testConfig.dlRootFolder, 'strict'),
        strictObjects: [
          'seattle.master',
          '/oslo.master',
          'v4.master'
        ],
        muteConsole: true
      };

      sppull(context, options).then(_ => done()).catch(done);
    });

    it(`should pull without subfolders data`, function(done: MochaDone): void {
      this.timeout(100 * 1000);

      const options: ISPPullOptions = {
        spRootFolder: '_catalogs/masterpage',
        dlRootFolder: path.join(testConfig.dlRootFolder, 'flat'),
        recursive: false,
        createEmptyFolders: false,
        muteConsole: true
      };

      sppull(context, options).then(_ => done()).catch(done);
    });

    it(`should pull folders structure`, function(done: MochaDone): void {
      this.timeout(300 * 1000);

      const options: ISPPullOptions = {
        spRootFolder: '_catalogs/masterpage',
        dlRootFolder: path.join(testConfig.dlRootFolder, 'structure'),
        foderStructureOnly: true,
        muteConsole: true
      };

      sppull(context, options).then(_ => done()).catch(done);
    });

    it(`should pull using caml condition`, function(done: MochaDone): void {
      this.timeout(100 * 1000);

      const d = new Date();
      d.setDate(d.getDate() - 5);
      const camlString = `
        <Eq>
          <FieldRef Name='Modified' />
          <Value Type='DateTime'>${d.toISOString()}</Value>
        </Eq>
      `;

      const options: ISPPullOptions = {
        dlRootFolder: path.join(testConfig.dlRootFolder, 'caml'),
        spDocLibUrl: 'Shared Documents',
        camlCondition: camlString,
        muteConsole: true
      };

      sppull(context, options).then(_ => done()).catch(done);
    });

    it(`should pull with additional metadata`, function(done: MochaDone): void {
      this.timeout(300 * 1000);

      const options: ISPPullOptions = {
        spRootFolder: '_catalogs/masterpage',
        dlRootFolder: path.join(testConfig.dlRootFolder, 'metadata'),
        recursive: false,
        metaFields: [ 'Title', 'Modified', 'Editor' ],
        muteConsole: true
      };

      sppull(context, options)
        .then(data => {
          fs.writeFileSync(
            path.join(options.dlRootFolder, 'metadata.json'),
            JSON.stringify(data.map(d => d.metadata), null, 2)
          );
          done();
        })
        .catch(done);
    });

    after('Deleting test objects', function(done: MochaDone): void {
      this.timeout(150 * 1000);
      deleteFolderRecursive(testConfig.dlRootFolder);
      done();
    });

  });

}
