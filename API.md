## Server API

#### GET /crawlers

```
[
  {
    "id": "1",
    "type": "well_master",
    "url": "http://google.com",
    "schedule": {},
    "delay": "none",
    "priority": "normal",
    "retry_attempts": 5,
    "retry_schedule": {}
  }
]
```

* *id* `string` - The crawler id
* *type* `string` - The type of crawler job
* *url* `string` - The starting point for the crawler
* *schedule* `string` or `object` - The schedule for the job to run on. Acceptable values:
  * `"none"` - Run immediately
  * `"default"` - Run the default schedule
  * `"At 10:00AM MST on the 3rd Friday of every month"`
  * As an object:
  ```json
    {
      "days": [],
      "hours": [],
      "minutes": [],
      "seconds": []
    }
    ```
* *delay* `string` - The delay before the job should be run on its schedule. Acceptable values:
  * `"none"` - Run immediately
  * `"default"` - Run the default schedule
  * `"5 days"`
  * As an object:
  ```json
    {
      "number": 5,
      "multiplier": "days"
    }
    ```
* *priority* `string` - The priority of the job. Acceptable values:
  * `"default"` - Run with default priority
  * `"high"` - High priority
  * `"medium"` - Medium priority
  * `"low"` - Low priority
* *retry_attempts* `integer` - The maximum number of retry attempts in case of failure until next normally scheduled run.
* *retry_schedule* `string` or `object` - The schedule for the retries
  * `"none"` - Retry immediately after failure
  * `"default"` -  Run on the default retry schedule
  * `"At 10:00AM MST on the 3rd Friday of every month"`
  * As an object:
  ```json
    {
      "days": [],
      "hours": [],
      "minutes": [],
      "seconds": []
    }
    ```

#### GET /stats
#### GET /job/search
#### GET /jobs/:from..:to/:order?
#### GET /jobs/:type/:state/:from..:to/:order?
#### GET /jobs/:state/:from..:to/:order?
#### GET /job/types
#### GET /job/:id
#### GET /job/:id/log
#### PUT /job/:id/state/:state
#### PUT /job/:id/priority/:priority
#### DELETE /job/:id
#### POST /job

You *must* provide a name or id. All the other fields defined for a crawler are optional

```json
{
  "type": "well_master"
}
```

or

```json
{
  "crawler_id": "1"
}
```

## Crawler API

#### .init
The constructor method for the crawler

#### .visit
Navigate to a given url or file path.

#### .find
Find something in the DOM using a selector.

#### .fill
Fill in a form or input field with some data.

#### .submit
Submit a form.

#### .click
Find a link by selector and click it.

#### .each
Loop through an array or object.

#### .then
Chaining method using deferred's

#### .run
The method that gets called when the crawler is actually run

#### .done
The method to call at the end of the crawler method chain to signify you are finished. (may not be needed if we are popping methods off a stack)

