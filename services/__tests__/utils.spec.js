import { getMilitaryTime, getStandardTime } from '../utils';

describe('utils getMilitaryTime', ()=>{
    test('simple getMilitaryTime AM', () => {
        const d = new Date();
        d.setHours(10, 32);
        const military = getMilitaryTime(d);
        expect(military).toBe(1032);
    });

    test('simple getMilitaryTime PM', () => {
        const d = new Date();
        d.setHours(22, 55);
        const military = getMilitaryTime(d);
        expect(military).toBe(2255);
    });

    test('simple getMilitaryTime short AM', () => {
        const d = new Date();
        d.setHours(2, 15);
        const military = getMilitaryTime(d);
        expect(military).toBe(215);
    });
});

describe('utils getStandardTime', ()=>{
    test('simple getStandardTime short AM', () => {
        const standard = getStandardTime(745);
        expect(standard).toBe('7:45 AM');
    });

    test('simple getStandardTime long AM', () => {
        const standard = getStandardTime(1121);
        expect(standard).toBe('11:21 AM');
    });

    test('simple getStandardTime short PM', () => {
        const standard = getStandardTime(1501);
        expect(standard).toBe('3:01 PM');
    });

    test('simple getStandardTime long PM', () => {
        const standard = getStandardTime(2205);
        expect(standard).toBe('10:05 PM');
    });

    test('simple getStandardTime null', () => {
        const standard = getStandardTime();
        expect(standard).toBe('???');
    });

    expect('invalid military time param throws error', () => {
        const standard = getStandardTime(55555);
    }).toThrow();
});
