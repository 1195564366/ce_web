import { Cache } from '@utils' 

const DIC = {
  find (dicName) {
    const dicData = Cache.get('EC_DIC').filter(item => item.enumType === dicName);
    return dicData.map(item => ({
      label: item.label,
      value: item.itemValue
    }))
  },
  findFilter (dicName, value) {
    const dicData = Cache.get('EC_DIC').filter(item => item.enumType === dicName);
    const filterData = dicData.filter(item => item.itemValue === value);
    return filterData[0] ? filterData[0].label || '-' : '-'
  }
}

export default DIC