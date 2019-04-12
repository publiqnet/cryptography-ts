// import {PbqPipe} from './pbq.pipe';
// import {DecimalPipe} from '@angular/common';
// import {inject, TestBed} from '@angular/core/testing';
// import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
//
// describe('PbqPipe', () => {
//     let pipe: PbqPipe;
//
//     beforeEach(() => {
//         // Must reset the test environment before initializing it.
//         TestBed.resetTestEnvironment();
//
//         TestBed
//             .initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting())
//             .configureTestingModule({
//                 declarations: [],
//                 providers: [
//                     DecimalPipe
//                 ]
//             });
//     });
//
//     it('create an instance', inject([DecimalPipe], (decimalPipe: DecimalPipe) => {
//             pipe = new PbqPipe(decimalPipe);
//             expect(pipe).toBeTruthy();
//         })
//     );
//
//     it('Transfer 100000000 to 1 PBQ', inject([DecimalPipe], (decimalPipe: DecimalPipe) => {
//             pipe = new PbqPipe(decimalPipe);
//             expect(pipe.transform(100000000)).toEqual('1 PBQ');
//         })
//     );
//
//     it('Transfer 1e+8 to 1 PBQ', inject([DecimalPipe], (decimalPipe: DecimalPipe) => {
//             pipe = new PbqPipe(decimalPipe);
//             expect(pipe.transform(1e+8)).toEqual('1 PBQ');
//         })
//     );
// });
