import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { calculateTax } from '../utils/taxEngine';
import { taxRules } from '../utils/taxRules';

const months = [
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
  'Feb',
  'Mar',
];

const initialMonthData = {
  includePfBasic: 'Y',
  includePfDa: 'Y',
  includePfConvey: 'N',
  includePfHra: 'N',
  includePfChEduc: 'N',
  includePfMedical: 'N',
  includePfLta: 'N',
  includePfUniformAll: 'N',
  includePfCarAllow: 'N',
  includePfMisc1: 'N',
  includePfMisc2: 'N',
  includePfMisc3: 'N',
  includePfMisc4: 'N',
  includePfMisc5: 'N',
  includePfMisc6: 'N',
  includePfMisc7: 'N',
  includePfMisc8: 'N',
  includePfMisc9: 'N',

  basic: 0,
  da: 0,
  convey: 0,
  hra: 0,
  chEduc: 0,
  medical: 0,
  lta: 0,
  uniformAll: 0,
  carAllow: 0,
  misc1: 0,
  misc2: 0,
  misc3: 0,
  misc4: 0,
  misc5: 0,
  misc6: 0,
  misc7: 0,
  misc8: 0,
  misc9: 0,
  profTax: 0,
  pf: 0,
  vpf: 0,
  it: 0,
  rent: 0,
  lifeInsur: 0,
  othDed1: 0,
  othDed2: 0,
  othDed3: 0,
  othDed4: 0,
  othDed5: 0,
  othDed6: 0,
  othDed7: 0,
  othDed8: 0,
  othDed9: 0,
  loanWdwl: 0,
  ob: 0,
  int: 0,
  cb: 0,
};

const initialState = {
  salaryMonths: months.map((m) => ({ month: m, ...initialMonthData })),
  settings: {
    vpfPercent: 0,
    coCarUsed: 'No',
    coCarDriver: 'No',
    inIndia: 'Yes',
    isMetro: 'No',
    pfPercent: 12,
  },
  declarations: {
    exemptions: {
      hra: { produced: 0 },
      transport: { produced: 0 },
      gratuity: { produced: 0 },
      childrenEduc: { produced: 0 },
      lta: { produced: 0 },
      uniform: { produced: 0 },
    },
    otherIncome: {
      bonus: 0,
      savingsInt: 0,
      dividends: 0,
      capitalGains: 0,
      crypto: 0,
    },
    deductions: {
      sec80D: { produced: 0 },
      sec80DD_DDB: { produced: 0 },
      sec80E_EEB: { produced: 0 },
      sec80G: { produced: 0 },
      sec80GG: { produced: 0 },
      sec80TTA_U: { produced: 0 },
      nps80CCD1B: { produced: 0 },
      nps80CCD2: { produced: 0 },
    },
    sec80C: {
      npsEmployee: 0,
      npsEmployer: 0,
      standard80C: 0,
      superannuation: 0,
    },
  },
  dynamicRows: {
    income: [{ id: 'misc1', label: 'Misc 1' }],
    deduction: [{ id: 'othDed1', label: 'Oth Ded 1' }],
  },
  houseProperty: {
    interest: 0,
  },
  age: 30,
};

const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    updateMonthData: (state, action) => {
      const { index, field, value, populateRemaining } = action.payload;

      if (field.startsWith('includePf')) {
        state.salaryMonths[index][field] = value;
        for (let i = index + 1; i < 12; i++) {
          state.salaryMonths[i][field] = value;
        }
      } else {
        const numValue = parseFloat(value) || 0;
        state.salaryMonths[index][field] = numValue;

        if (populateRemaining) {
          for (let i = index + 1; i < 12; i++) {
            state.salaryMonths[i][field] = numValue;
          }
        }
      }
    },
    populateRowFromFirstMonth: (state, action) => {
      const { field } = action.payload;
      const val = state.salaryMonths[0][field];
      for (let i = 1; i < 12; i++) {
        state.salaryMonths[i][field] = val;
      }
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    updateDeclaration: (state, action) => {
      const { section, field, value } = action.payload;
      if (typeof value === 'object' && value !== null) {
        state.declarations[section][field] = {
          ...state.declarations[section][field],
          ...value,
        };
      } else {
        state.declarations[section][field] = value;
      }
    },
    addDynamicRow: (state, action) => {
      const { type, label } = action.payload;
      const maxCount = 9;
      const list = state.dynamicRows[type];
      if (list.length >= maxCount) return;
      const prefix = type === 'income' ? 'misc' : 'othDed';
      for (let i = 1; i <= maxCount; i++) {
        const id = `${prefix}${i}`;
        if (!list.find((r) => r.id === id)) {
          list.push({ id, label });
          break;
        }
      }
    },
    editDynamicRow: (state, action) => {
      const { type, id, label } = action.payload;
      const row = state.dynamicRows[type].find((r) => r.id === id);
      if (row) row.label = label;
    },
    deleteDynamicRow: (state, action) => {
      const { type, id } = action.payload;
      state.dynamicRows[type] = state.dynamicRows[type].filter(
        (r) => r.id !== id,
      );
      state.salaryMonths.forEach((m) => {
        m[id] = 0;
      });
    },
    updateHouseProperty: (state, action) => {
      state.houseProperty = { ...state.houseProperty, ...action.payload };
    },
    updateAge: (state, action) => {
      state.age = action.payload;
    },
  },
});

export const {
  updateMonthData,
  updateSettings,
  updateDeclaration,
  addDynamicRow,
  editDynamicRow,
  deleteDynamicRow,
  updateHouseProperty,
  updateAge,
} = taxSlice.actions;

export const selectSalaryMonths = (state) => state.tax.salaryMonths;
export const selectSettings = (state) => state.tax.settings;
export const selectDeclarations = (state) => state.tax.declarations;
export const selectDynamicRows = (state) => state.tax.dynamicRows;
export const selectHouseProperty = (state) => state.tax.houseProperty;
export const selectAge = (state) => state.tax.age;

export const selectCalculatedSalary = createSelector(
  [selectSalaryMonths, selectSettings],
  (monthsData, settings) => {
    let totalAnnualIncome = 0;
    let totalAnnualBasic = 0;
    let totalAnnualHraReceived = 0;
    let totalAnnualRentPaid = 0;
    let totalAnnualLtaReceived = 0;
    let totalAnnualUniformAll = 0;
    let totalAnnualPF = 0;
    let totalAnnualVPF = 0;
    let totalAnnualProfTax = 0;
    let totalAnnualLifeInsur = 0;

    const pfPercent = parseFloat(settings.pfPercent) || 0;
    const vpfPercent = parseFloat(settings.vpfPercent) || 0;

    const calculatedMonths = monthsData.map((month) => {
      const earnings =
        (month.basic || 0) +
        (month.da || 0) +
        (month.convey || 0) +
        (month.hra || 0) +
        (month.chEduc || 0) +
        (month.medical || 0) +
        (month.lta || 0) +
        (month.uniformAll || 0) +
        (month.carAllow || 0) +
        (month.misc1 || 0) +
        (month.misc2 || 0) +
        (month.misc3 || 0) +
        (month.misc4 || 0) +
        (month.misc5 || 0) +
        (month.misc6 || 0) +
        (month.misc7 || 0) +
        (month.misc8 || 0) +
        (month.misc9 || 0);

      let pfBase = 0;
      if (month.includePfBasic === 'Y') pfBase += month.basic || 0;
      if (month.includePfDa === 'Y') pfBase += month.da || 0;
      if (month.includePfConvey === 'Y') pfBase += month.convey || 0;
      if (month.includePfHra === 'Y') pfBase += month.hra || 0;
      if (month.includePfChEduc === 'Y') pfBase += month.chEduc || 0;
      if (month.includePfMedical === 'Y') pfBase += month.medical || 0;
      if (month.includePfLta === 'Y') pfBase += month.lta || 0;
      if (month.includePfUniformAll === 'Y') pfBase += month.uniformAll || 0;
      if (month.includePfCarAllow === 'Y') pfBase += month.carAllow || 0;
      if (month.includePfMisc1 === 'Y') pfBase += month.misc1 || 0;
      if (month.includePfMisc2 === 'Y') pfBase += month.misc2 || 0;
      if (month.includePfMisc3 === 'Y') pfBase += month.misc3 || 0;
      if (month.includePfMisc4 === 'Y') pfBase += month.misc4 || 0;
      if (month.includePfMisc5 === 'Y') pfBase += month.misc5 || 0;
      if (month.includePfMisc6 === 'Y') pfBase += month.misc6 || 0;
      if (month.includePfMisc7 === 'Y') pfBase += month.misc7 || 0;
      if (month.includePfMisc8 === 'Y') pfBase += month.misc8 || 0;
      if (month.includePfMisc9 === 'Y') pfBase += month.misc9 || 0;

      const pf = (pfBase * pfPercent) / 100;
      const vpf = (pfBase * vpfPercent) / 100;

      const deductions =
        (month.profTax || 0) +
        pf +
        vpf +
        (month.it || 0) +
        (month.rent || 0) +
        (month.lifeInsur || 0) +
        (month.othDed1 || 0) +
        (month.othDed2 || 0) +
        (month.othDed3 || 0) +
        (month.othDed4 || 0) +
        (month.othDed5 || 0) +
        (month.othDed6 || 0) +
        (month.othDed7 || 0) +
        (month.othDed8 || 0) +
        (month.othDed9 || 0);

      const net = earnings - deductions;

      totalAnnualIncome += earnings;
      totalAnnualBasic += month.basic || 0;
      totalAnnualHraReceived += month.hra || 0;
      totalAnnualLtaReceived += month.lta || 0;
      totalAnnualUniformAll += month.uniformAll || 0;
      totalAnnualRentPaid += month.rent || 0;
      totalAnnualPF += pf;
      totalAnnualVPF += vpf;
      totalAnnualProfTax += month.profTax || 0;
      totalAnnualLifeInsur += month.lifeInsur || 0;

      return {
        ...month,
        total: earnings,
        pf,
        vpf,
        totDed: deductions,
        net,
      };
    });

    return {
      months: calculatedMonths,
      annual: {
        totalIncome: totalAnnualIncome,
        basic: totalAnnualBasic,
        hraReceived: totalAnnualHraReceived,
        ltaReceived: totalAnnualLtaReceived,
        uniformAll: totalAnnualUniformAll,
        rentPaid: totalAnnualRentPaid,
        pf: totalAnnualPF,
        vpf: totalAnnualVPF,
        profTax: totalAnnualProfTax,
        lifeInsur: totalAnnualLifeInsur,
      },
    };
  },
);

export const selectCalculatedDeclarations = createSelector(
  [selectCalculatedSalary, selectDeclarations, selectSettings, selectAge],
  (calcSalary, declarations, settings, age) => {
    const annual = calcSalary.annual;
    const ex = declarations.exemptions;
    const ded = declarations.deductions;
    const c80 = declarations.sec80C;

    const HRA_RENT_MINUS_10_PERCENT_BASIC = Math.max(
      0,
      (parseFloat(annual.rentPaid) || 0) -
        0.1 * (parseFloat(annual.basic) || 0),
    );
    const HRA_PERCENT_BASIC =
      settings.isMetro === 'Yes'
        ? 0.5 * (parseFloat(annual.basic) || 0)
        : 0.4 * (parseFloat(annual.basic) || 0);
    const hraLimited = Math.min(
      parseFloat(ex.hra?.produced) || 0,
      Math.min(
        annual.hraReceived || 0,
        Math.min(HRA_RENT_MINUS_10_PERCENT_BASIC, HRA_PERCENT_BASIC),
      ),
    );

    const ltaLimited = Math.min(
      parseFloat(ex.lta?.produced) || 0,
      annual.ltaReceived || 0,
    );
    const childrenEducLimited = Math.min(
      parseFloat(ex.childrenEduc?.produced) || 0,
      2400,
    );
    const transportLimited = Math.min(
      parseFloat(ex.transport?.produced) || 0,
      38400,
    );
    const uniformLimited = Math.min(
      parseFloat(ex.uniform?.produced) || 0,
      annual.uniformAll || 0,
    );
    const gratuityLimited = parseFloat(ex.gratuity?.produced) || 0;

    const sec80CLimited = Math.min(
      (parseFloat(c80.npsEmployee) || 0) +
        (parseFloat(c80.standard80C) || 0) +
        annual.pf +
        annual.vpf +
        annual.lifeInsur,
      taxRules.deductions.sec80C.limit,
    );

    const sec80DLimit =
      age >= 60
        ? taxRules.deductions.sec80D.limitSenior
        : taxRules.deductions.sec80D.limit;

    return {
      exemptions: {
        hra: { ...ex.hra, limited: hraLimited },
        transport: { ...ex.transport, limited: transportLimited },
        gratuity: { ...ex.gratuity, limited: gratuityLimited },
        childrenEduc: { ...ex.childrenEduc, limited: childrenEducLimited },
        lta: { ...ex.lta, limited: ltaLimited },
        uniform: { ...ex.uniform, limited: uniformLimited },
        totalLimited:
          hraLimited +
          ltaLimited +
          childrenEducLimited +
          transportLimited +
          uniformLimited +
          gratuityLimited,
      },
      sec80C: {
        ...c80,
        limited: sec80CLimited,
        totalProduced:
          (parseFloat(c80.npsEmployee) || 0) +
          (parseFloat(c80.standard80C) || 0) +
          annual.pf +
          annual.vpf +
          annual.lifeInsur,
      },
      deductions: {
        sec80D: {
          ...ded.sec80D,
          limited: Math.min(parseFloat(ded.sec80D?.produced) || 0, sec80DLimit),
        },
        sec80DD_DDB: {
          ...ded.sec80DD_DDB,
          limited: Math.min(parseFloat(ded.sec80DD_DDB?.produced) || 0, 125000),
        },
        sec80E_EEB: {
          ...ded.sec80E_EEB,
          limited: parseFloat(ded.sec80E_EEB?.produced) || 0,
        },
        sec80G: {
          ...ded.sec80G,
          limited: parseFloat(ded.sec80G?.produced) || 0,
        },
        sec80GG: {
          ...ded.sec80GG,
          limited: Math.min(parseFloat(ded.sec80GG?.produced) || 0, 60000),
        },
        sec80TTA_U: {
          ...ded.sec80TTA_U,
          limited: Math.min(
            parseFloat(ded.sec80TTA_U?.produced) || 0,
            taxRules.deductions.sec80TTA.limit,
          ),
        },
        nps80CCD1B: {
          ...ded.nps80CCD1B,
          limited: Math.min(
            parseFloat(ded.nps80CCD1B?.produced) || 0,
            taxRules.deductions.nps80CCD1B.limit,
          ),
        },
        nps80CCD2: {
          ...ded.nps80CCD2,
          limited: parseFloat(ded.nps80CCD2?.produced) || 0,
        },
      },
      otherIncome: declarations.otherIncome,
    };
  },
);

export const selectTaxComparison = createSelector(
  [
    selectCalculatedSalary,
    selectCalculatedDeclarations,
    selectHouseProperty,
    selectAge,
  ],
  (calcSalary, calcDecl, houseProperty, age) => {
    const annual = calcSalary.annual;

    const income = {
      salary: annual.totalIncome,
    };

    const meta = {
      age: age,
      profTax: annual.profTax,
    };

    return calculateTax(income, calcDecl, houseProperty, meta);
  },
);

export default taxSlice.reducer;
