# worker

  > status : [private]()

 A worker is the internal representation of a job process. It is private and is basically a redis client + a job


## Concept

 A worker enable the communication bridge between the roach server and its jobs. Every message is backend by redis, every job is queued, every data is saved, etc.


### Sandboxed jobs

 Thanks to the worker, a job is not tight to roach. It doesn't know about the roach implementation and so, can be or do anything. For example, a job could just be a single function.

 A job can be reused outside of roach.

### Lifecycles

 A job is just a nice and clean API to communicate with the worker. Something really nice is that you can initialize your job even before it's started (when the job receives the `start` command). For example, you could grab and store some data before processing it on `start`.

