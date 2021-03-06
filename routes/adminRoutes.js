// routes/adminRoutes.js

var session = require('../middleware/session.js');
var inventory = require('../middleware/inventory.js');
var admin = require('../middleware/admin.js');
var mysql = require('mysql');

module.exports = function(app, passport, db) {
  // =====================================
	// ADMIN ===============================
	// =====================================
	app.get('/admin', session.isLoggedIn, function(req,res) {
		if(req.app.locals.user.role != 1) {
			res.redirect('/404');
		} else {
			res.render('admin.ejs');
		}
	});

	// =====================================
	// ADMIN - USERS =======================
	// =====================================
	app.get('/admin/users', session.isLoggedIn, session.isAdmin, function(req,res) {
		// get Users table and pass it to ejs
		admin.getUsers(function(err, users) {
      if(err) {
				console.error(err.stack);
  			res.status(500).send('Get users did not work!');
      }
			else {
				admin.getRoles(function(err, userRoles) {
						res.render('admin/users.ejs', { users:users, userRoles:userRoles });
				});
			}
		});
	});

	app.post('/admin/users', function(req, res) {
		var id = req.body.userID;
		var role = req.body.userRole;

		var query = "UPDATE users " +
						"SET role = '"+role+"' " +
						"WHERE id = "+id;

		db.query(query, function(err, rows) {
			var response = {
				status: 200,
				message: "Item updated successfully."
			}
			if(err) {
				response = {
					status: 500,
					message: "Error updating item."
				}
			}
			res.end(JSON.stringify(response));
		});
	});

	// =====================================
	// ADMIN - INVENTORY ===================
	// =====================================
	app.get('/admin/inventory', session.isLoggedIn, session.isAdmin, function(req,res) {
		// get Inventory table and pass it to ejs
    inventory.getInventory(function(err, inventory) {
      if(err) {
				console.error(err.stack);
  			res.status(500).send('Get inventory did not work!');
      }
			else {
				admin.getInventoryTypes(function(err, inventoryTypes) {
						res.render('admin/inventory.ejs', { inventory:inventory, inventoryTypes:inventoryTypes });
				});
			}
		});
	});

	app.post('/admin/inventory', function(req, res) {
		var id = req.body.itemID;
		var name = undefined;
		var price = undefined;
		var type = undefined;
		var query = undefined;

		if (typeof id === 'undefined' || !id) {
			name = req.body.addName;
			price = req.body.addPrice;
			type = req.body.addType;
			query = "INSERT INTO inventory(name, price, type) " +
							"VALUES('"+name+"', "+price+", '"+type+"')";
		}
		else {
			name = req.body.itemName;
			price = req.body.itemPrice;
			type = req.body.itemType;
			query = "UPDATE inventory " +
							"SET name = '"+name+"', " +
							"price = "+price+", " +
							"type = '"+type+"' " +
							"WHERE id = "+id;
		}

		db.query(query, function(err, rows) {
			var response = {
				status: 200,
				message: "Item updated successfully."
			}
			if(err) {
				response = {
					status: 500,
					message: "Error updating item."
				}
			}
			res.end(JSON.stringify(response));
		});
	});

	// =====================================
	// ADMIN - INVENTORY TYPES =============
	// =====================================
	app.get('/admin/inventoryTypes', session.isLoggedIn, session.isAdmin, function(req,res) {
		// get Inventory Types table and pass it to ejs
		admin.getInventoryTypes(function(err, inventoryTypes) {
			if(err) {
				res.render('admin/inventoryTypes.ejs', { inventoryTypes:undefined });
			} else {
				res.render('admin/inventoryTypes.ejs', { inventoryTypes:inventoryTypes });
			}
		});
	});

	app.post('/admin/inventoryTypes', function(req, res) {
		var id = req.body.typeID;
		var type = undefined;
		var markup = undefined;
		var query = undefined;

		if (typeof id === 'undefined' || !id) {
			type = req.body.addName;
			markup = req.body.addMarkup;
			query = "INSERT INTO inventory_types(type, markup) " +
							"VALUES('"+type+"', "+markup+")";
		}
		else {
			type = req.body.typeName;
			markup = req.body.typeMarkup;
			query = "UPDATE inventory_types " +
							"SET type = '"+type+"', " +
							"markup = "+markup+" " +
							"WHERE id = "+id;
		}

		db.query(query, function(err, rows) {
			var response = {
				status: 200,
				message: "Type updated successfully."
			}
			if(err) {
				response = {
					status: 500,
					message: "Error updating type."
				}
			}
			res.end(JSON.stringify(response));
		});
	});

	// =====================================
	// ADMIN - MARKUPS =====================
	// =====================================
	app.get('/admin/markups', session.isLoggedIn, session.isAdmin, function(req,res) {
		// get Markups table and pass it to ejs
		admin.getMarkups(function(err, markups) {
			if(err) {
				res.render('admin/markups.ejs', { markups:undefined });
			} else {
				res.render('admin/markups.ejs', { markups:markups });
			}
		});
	});

	app.post('/admin/markups', function(req, res) {
		var value = req.body.markupValue;
		var id = req.body.markupID;

		console.log(value + " " + id);

		var query = "UPDATE markups " +
								"SET markup = "+value+" " +
								"WHERE id = "+id;

		db.query(query, function(err, rows) {
			var response = {
				status: 200,
				message: "Markup updated successfully."
			}
			if(err) {
				response = {
					status: 500,
					message: "Error updating markup."
				}
			}
			res.end(JSON.stringify(response));
		});
	});

	// =====================================
	// ADMIN - TAXES =====================
	// =====================================
	app.get('/admin/taxes', session.isLoggedIn, session.isAdmin, function(req,res) {
		// get Markups table and pass it to ejs
		admin.getTaxes(function(err, taxes) {
			if(err) {
				res.render('admin/taxes.ejs', { taxes:undefined });
			} else {
				res.render('admin/taxes.ejs', { taxes:taxes });
			}
		});
	});

	app.post('/admin/taxes', function(req, res) {
		var id = req.body.taxID;
		var name = undefined;
		var rate = undefined;
		var query = undefined;

		if (typeof id === 'undefined' || !id) {
			name = req.body.addName;
			rate = req.body.addRate;
			query = "INSERT INTO taxes(name, rate) " +
							"VALUES('"+name+"', "+rate+")";
		}
		else {
			name = req.body.taxName;
			rate = req.body.taxRate;
			query = "UPDATE taxes " +
							"SET name = '"+name+"', " +
							"rate = "+rate+" " +
							"WHERE id = "+id;
		}

		db.query(query, function(err, rows) {
			var response = {
				status: 200,
				message: "Tax updated successfully."
			}
			if(err) {
				response = {
					status: 500,
					message: "Error updating type."
				}
			}
			res.end(JSON.stringify(response));
		});
	});
};
