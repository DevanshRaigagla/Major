// utils.js
const { v4: uuidv4 } = require('uuid');

function nowSql() {
  return new Date();
}

module.exports = {
  uuid: uuidv4,
  nowSql
};
