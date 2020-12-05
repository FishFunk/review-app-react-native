// import { getMilitaryTime, getStandardTime, checkForOpenCloseHours } from '../utils';
import Utils from '../utils';

describe('utils getMilitaryTime', ()=>{
    test('simple getMilitaryTime AM', () => {
        const d = new Date();
        d.setHours(10, 32);
        const military = Utils.getMilitaryTime(d);
        expect(military).toBe(1032);
    });

    test('simple getMilitaryTime PM', () => {
        const d = new Date();
        d.setHours(22, 55);
        const military = Utils.getMilitaryTime(d);
        expect(military).toBe(2255);
    });

    test('simple getMilitaryTime short AM', () => {
        const d = new Date();
        d.setHours(2, 15);
        const military = Utils.getMilitaryTime(d);
        expect(military).toBe(215);
    });
});

describe('utils getStandardTime', ()=>{
    test('simple getStandardTime short AM', () => {
        const standard = Utils.getStandardTime(745);
        expect(standard).toBe('7:45 AM');
    });

    test('simple getStandardTime long AM', () => {
        const standard = Utils.getStandardTime(1121);
        expect(standard).toBe('11:21 AM');
    });

    test('simple getStandardTime short PM', () => {
        const standard = Utils.getStandardTime(1501);
        expect(standard).toBe('3:01 PM');
    });

    test('simple getStandardTime long PM', () => {
        const standard = Utils.getStandardTime(2205);
        expect(standard).toBe('10:05 PM');
    });

    test('simple getStandardTime null', () => {
        const standard = Utils.getStandardTime();
        expect(standard).toBe('???');
    });

    expect(() => {
        const standard = Utils.getStandardTime(55555);
    }).toThrow();
});

describe('utils checkForOpenCloseHours', ()=>{

    let timePeriods = {
        periods: [{
            open: {
                day: 0,
                time: 900
            },
            close: {
                day: 0,
                time: 2000
            }
        }]
    };

    test('checkForOpenCloseHours closed early', () => {
        const spy = jest.spyOn(global, 'Date').mockImplementation(() => {
            return {
                getDay: ()=>0,
                getHours: ()=>8,
                getMinutes: ()=>0
            }
        });

        const spy1 = jest.spyOn(Utils, 'addMinutesToDate').mockImplementation(()=>{
            return {
                getDay: ()=>0,
                getHours: ()=>8,
                getMinutes: ()=>45,
                getTime: ()=>{},
                setTime: ()=>{}
            }
        });

        const result = Utils.checkForOpenCloseHours(timePeriods);
        expect(result.message).toContain('Closed.');
        expect(result.open_now).toBe(false);
    });

    test('checkForOpenCloseHours closed late', () => {
        const spy = jest.spyOn(global, 'Date').mockImplementation(() => {
            return {
                getDay: ()=>0,
                getHours: ()=>22,
                getMinutes: ()=>0
            }
        });

        const result = Utils.checkForOpenCloseHours(timePeriods);
        expect(result.message).toContain('Closed.');
        expect(result.open_now).toBe(false);
    });

    test('checkForOpenCloseHours closing soon', () => {
        const spy = jest.spyOn(global, 'Date').mockImplementation(() => {
            return {
                getDay: ()=>0,
                getHours: ()=>19,
                getMinutes: ()=>30,
                getTime: ()=>{},
                setTime: ()=>{}
            }
        });

        const spy1 = jest.spyOn(Utils, 'addMinutesToDate').mockImplementation(()=>{
            return {
                getDay: ()=>0,
                getHours: ()=>20,
                getMinutes: ()=>15,
                getTime: ()=>{},
                setTime: ()=>{}
            }
        });

        const result = Utils.checkForOpenCloseHours(timePeriods);
        expect(result.message).toContain('Closing soon');
        expect(result.open_now).toBe(true);
    });

    test('checkForOpenCloseHours opening soon', () => {
        const spy = jest.spyOn(global, 'Date').mockImplementation(() => {
            return {
                getDay: ()=>0,
                getHours: ()=>8,
                getMinutes: ()=>30,
                getTime: ()=>{},
                setTime: ()=>{}
            }
        });

        const spy1 = jest.spyOn(Utils, 'addMinutesToDate').mockImplementation(()=>{
            return {
                getDay: ()=>0,
                getHours: ()=>9,
                getMinutes: ()=>15,
                getTime: ()=>{},
                setTime: ()=>{}
            }
        });

        const result = Utils.checkForOpenCloseHours(timePeriods);
        expect(result.message).toContain('Opening soon');
        expect(result.open_now).toBe(false);
    });

    test('checkForOpenCloseHours open', () => {
        const spy = jest.spyOn(global, 'Date').mockImplementation(() => {
            return {
                getDay: ()=>0,
                getHours: ()=>12,
                getMinutes: ()=>0,
                getTime: ()=>{},
                setTime: ()=>{}
            }
        });

        const spy1 = jest.spyOn(Utils, 'addMinutesToDate').mockImplementation(()=>{
            return {
                getDay: ()=>0,
                getHours: ()=>12,
                getMinutes: ()=>45,
                getTime: ()=>{},
                setTime: ()=>{}
            }
        });

        const result = Utils.checkForOpenCloseHours(timePeriods);
        expect(result.message).toContain('Open 9:00 AM - 8:00 PM');
        expect(result.open_now).toBe(true);
    });

    test('checkForOpenCloseHours Closed with no period data', () => {
        timePeriods = {
            open_now: false
        };

        const result = Utils.checkForOpenCloseHours(timePeriods);
        expect(result.message).toBe('');
        expect(result.open_now).toBe(false);
    });

    test('checkForOpenCloseHours Open with no period data', () => {
        timePeriods = {
            open_now: true
        };

        const result = Utils.checkForOpenCloseHours(timePeriods);
        expect(result.message).toBe('');
        expect(result.open_now).toBe(true);
    });
});
