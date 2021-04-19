let cid = 0;
let pid = 0;
let Queue = function() {
  this.queue = [];
  this.productors = [];
  this.consumers = [];
}

Queue.prototype.available = function() {
  return this.queue.length;
}


Queue.prototype.addProductor = function(productor) {
  this.productors.push(productor);
  return pid++;
}

Queue.prototype.addConsumer = function(consumer) {
  this.consumers.push(consumer);
  return cid++;
}

Queue.prototype.addTask = function(tasks) {
  this.queue = this.queue.concat(tasks);
  this.consumers.forEach(cs => cs.notifyC());
}

Queue.prototype.shiftTask = function(n = 1) {
  let tasks = this.queue.splice(0, n);
  this.productors.forEach(pd => pd.notifyP());
  return tasks;
}
