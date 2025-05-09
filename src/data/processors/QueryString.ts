//data
import type Nest from '../Nest.js';

export default class QueryString {
  /**
   * The main nest
   */
  public nest: Nest;

  /**
   * Sets the nest 
   */
  constructor(nest: Nest) {
    this.nest = nest;
  }

  /**
   * Creates the name space given the space
   * and sets the value to that name space
   */
  set(...path: any[]): Nest {
    if (path.length < 1) {
      return this.nest;
    }

    const query = path.pop();

    const separator = '~~' + Math.floor(Math.random() * 10000) + '~~';
    query.split(/\&/gi).forEach((filter: any) => {
      //key eg. foo[bar][][baz]
      let [ key, ...values ] = filter.split('=');
      let value = values.join('=');
      key = decodeURIComponent(key);
      value = value.replace(/\+/g, ' ');
      value = decodeURIComponent(value);
      //change path to N notation
      //ex. foo[bar][][baz]
      const keys = key
        //to. foo[bar~~123~~~~123~~baz]
        .replace(/\]\[/g, separator)
        //to. foo~~123~~bar~~123~~~~123~~baz]
        .replace('[', separator)
        //to. foo~~123~~bar~~123~~~~123~~baz
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        //to. foo,bar,,baz
        .split(separator)
        .map((key: any) => {
          const index = Number(key);
          //if its a possible integer
          if (key && !isNaN(index) && key.indexOf('.') === -1) {
            return index;
          }

          return key;
        });

      const paths = path.concat(keys);

      if (/(^\{.*\}$)|(^\[.*\]$)/.test(value)) {
        try {
          return query.set(...paths, JSON.parse(value));
        } catch(e) {}
      }

      if (value.length > 0 && !isNaN(Number(value))) {
        this.nest.set(...paths, Number(value));
      } else if (value === 'true') {
        this.nest.set(...paths, true);
      } else if (value === 'false') {
        this.nest.set(...paths, false);
      } else if (value === 'null') {
        this.nest.set(...paths, null);
      } else {
        this.nest.set(...paths, value);
      }
    });

    return this.nest;
  }
}