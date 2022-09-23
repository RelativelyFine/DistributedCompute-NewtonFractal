async function main() {
  const compute = require("dcp/compute");
  // Rest of the code will go in the following sections:
  /* INPUT DATA */
  const inputSet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  /* WORK FUNCTION */
  async function workFunction(num) {
    progress();
    return num * num;
  }
  /* COMPUTE FOR */
  const job = compute.for(inputSet, workFunction);
  job.public.name = "squareNumbers";
  /* PROCESS RESULTS */
  let resultSet = await job.exec();
  resultSet = Array.from(resultSet);
  console.log(resultSet);
}
require("dcp-client").init("https://scheduler.distributed.computer").then(main);
