let Coroutine = function (count) {
  this.queue = new Queue();
  this.queue.addProductor(this);
  this.queue.addConsumer(this);
  this.count = count;
}

/**
 * @param {Array < () => any > | (() => any)} tasks
 */
Coroutine.prototype.addTask = function(tasks) {
  this.queue.addTask(tasks);
}

Coroutine.prototype.notifyP = function() {

}

Coroutine.prototype.notifyC = function() {
  if (this.running) return;
  this.running = true;

  setTimeout(this.run.bind(this), 0);
}

Coroutine.prototype.run = function() {
  let tasks = this.queue.shiftTask(this.count);
  tasks.forEach(task => task());
  if (this.queue.available()) {
    setTimeout(this.run.bind(this), 0);
  } else {
    this.running = false;
  }
}

let coroutine = new Coroutine();