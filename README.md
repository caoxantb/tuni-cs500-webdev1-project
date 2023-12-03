# Welcome to your group's Web Development 1 group work repository

# WebDev1 group work assignment, rounds 8-11

What should be in this document is detailed in the 11th exercise round assignment document in Google Docs. "Group" and "Tests and documentation" are shown below as examples and to give a starting point for your documentation work.

# Group 

Member1:  name, email, student ID, 
resposible for: TODO, short description of duties 

Member2:  name, email, student ID, 
resposible for: TODO, short description of duties 


Member2:  name, email, student ID, 
resposible for: TODO, short description of duties 

......


## Tests and documentation

TODO: A table with links to at least 10 of your group's GitLab issues, listed with their associated Mocha tests and test files.

## 8.3.3 Pages and navigation

![Alt text](pages.png)

## 8.3.4 Data models

<b> User <b>

| Field | Type | Description |
| --- | --- | --- |
| _id | string | ID of user account |
| name | string | Name of user |
| email | string | Email of user account |
| password | string | Password of user account |
| role | string | Role of user (customer/admin) |

<b> Product <b>

| Field | Type | Description |
| --- | --- | --- |
| _id | string | ID of product |
| name | string | Name of product |
| price | float | Price of product |
| image | string | URL of product image |
| description | string | Description of product |

<b> Order <b>

| Field | Type | Description | Relationship |
| --- | --- | --- | --- |
| _id | string | ID of product | |
| customerId | string | ID of customer who placed the order | Reference to <b>Customer<b> model |
| items | Array< OrderedItem > | List of ordered items | Reference to the <b>Ordered Item<b> model |

<b> OrderedItem <b>

| Field | Type | Description | Relationship |
| --- | --- | --- | --- |
| _id | string | ID of product | |
| productId | Product | Ordered product | Reference to <b>Product<b> model |
| quantity | int | Number of items ordered | |

## 8.3.5 Security concerns

<b>There are some cyber crime our web can meet:</b>
* Cross-Site Scripting (XSS) 
* Session hijacking
* SQL Injection
* Directory traversal
  
<b>Because our web has a submission block for user login,  our cookies is not well protected & our URL did not encode yet.
We can prevent those by:</b>

* We strictly validate user input when login
* We using HTTPS instead of HTTP
* Urlencode our URL

## 8.3.7 Finalization
<b>Learning from project</b>
* Construction of simple end-to-end applications
* Basics understanding of browser: HTML, CSS, JS, DOM
* Basic understanding of HTTP servers
* Creating Dynamic web applications
* HTTP sessions
* Handling of HTTP requests
* Architecture insights
* User authentication technologies
* Dynamic DOM programming from JavaScript

<b>Improving later</b>
* Using a different authentication method
* Having a payment page when users place an order in the shopping cart
* When login in as a customer role, the register page and user page do not show
