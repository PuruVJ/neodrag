/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 */

/** @type {HtmlExtension} */
export const gfmTaskListItemHtml = {
  enter: {
    taskListCheck() {
      this.tag('<input type="checkbox" disabled="" ')
    }
  },
  exit: {
    taskListCheck() {
      this.tag('/>')
    },

    taskListCheckValueChecked() {
      this.tag('checked="" ')
    }
  }
}
