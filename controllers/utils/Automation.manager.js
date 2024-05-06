const CronJob = require('cron').CronJob;

class AutomationManager{
	/**
	 * Cronjob Object
	 */
	#cronJobs = []
	/**
	 * 
	 * @param {*} interval integer in munites
	 * @param {*} callback function to run
	 */
	registerTask(interval, callback){
		this.#cronJobs.push = new CronJob(this.#getCronPattern(interval), () => {
			callback();
		}, () => { console.log('Run automation script for :', callback.name); });;
	}

	initilizeTasks(){
		this.#cronJobs.forEach(cronJob => {
			cronJob.stop();
			cronJob.start();
		});
	}
	/**
	 * interval is the minutes before the task runs
	 * task is the function to run
	 *
	 * @param {interval, task}
	 */
	runTask({ interval, task }){
		this.#runRecurringJob(interval, task);
	}

	#runRecurringJob(interval, task) {
		const job = new CronJob(this.#getCronPattern(interval), () => {
			console.log('Running automation script for :', task.name);
			task();
		});
		job.start();
	}

	#getCronPattern(interval){
		let pattern;
		if(interval > 60){
			pattern = `* ${interval % 60} ${interval / 60} * * *`
		}else{
			pattern = `* */${interval} * * * *`
		}
		
		return pattern;

	}
}

module.exports = AutomationManager