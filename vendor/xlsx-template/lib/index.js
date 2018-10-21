/**
 * jshint globalstrict:true, devel:true
 * eslint no-let:0
 * global require, module, exports, process, __dirname, Buffer
 */
'use strict';

const path = require('path'),
	zip = require('jszip'),
	etree = require('elementtree'),
	subElement = etree.SubElement;

module.exports = (function () {

	let DOCUMENT_RELATIONSHIP = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
		CALC_CHAIN_RELATIONSHIP = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/calcChain',
		SHARED_STRINGS_RELATIONSHIP = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings';

	/**
	 * Create a new workbook. Either pass the raw data of a .xlsx file,
	 * or call `loadTemplate()` later.
	 */
	let Workbook = function (data) {
		let self = this;

		self.archive = null;
		self.sharedStrings = [];
		self.sharedStringsLookup = {};

		if (data) {
			self.loadTemplate(data);
		}
	};

	let _get_simple = function (obj, desc) {
		if (desc.indexOf('[') >= 0) {
			let specification = desc.split(/[[[\]]/);
			let property = specification[0];
			let index = specification[1];
			return obj[property][index];
		}

		return obj[desc];
	};

	/**
	 * Based on http://stackoverflow.com/questions/8051975
	 * Mimic https://lodash.com/docs#get
	 *
	 * @param obj
	 * @param desc
	 * @param defaultValue
	 * @return {*}
	 * @private
	 */
	let _get = function (obj, desc, defaultValue) {
		let arr = desc.split('.');
		try {
			while (arr.length) {
				obj = _get_simple(obj, arr.shift());
			}
		} catch (ex) {
			/* invalid chain */
			obj = undefined;
		}
		return obj === undefined ? defaultValue : obj;
	};

	/**
	 * Delete unused sheets if needed.
	 *
	 * @param sheetName
	 * @return {exports}
	 */
	Workbook.prototype.deleteSheet = function (sheetName) {
		let self = this;
		let sheet = self.loadSheet(sheetName);

		let sh = self.workbook.find('sheets/sheet[@sheetId=\'' + sheet.id + '\']');
		self.workbook.find('sheets').remove(sh);

		let rel = self.workbookRels.find('Relationship[@Id=\'' + sh.attrib['r:id'] + '\']');
		self.workbookRels.remove(rel);

		self._rebuild();
		return self;
	};

	/**
	 * Clone sheets in current workbook template.
	 *
	 * @param sheetName
	 * @param copyName
	 * @return {exports}
	 */
	Workbook.prototype.copySheet = function (sheetName, copyName) {
		let self = this;
		let sheet = self.loadSheet(sheetName); //filename, name , id, root
		let newSheetIndex = (self.workbook.findall('sheets/sheet').length + 1).toString();
		let fileName = 'worksheets' + '/' + 'sheet' + newSheetIndex + '.xml';
		let arcName = self.prefix + '/' + fileName;

		self.archive.file(arcName, etree.tostring(sheet.root));
		self.archive.files[arcName].options.binary = true;

		let newSheet = etree.SubElement(self.workbook.find('sheets'), 'sheet');
		newSheet.attrib.name = copyName || 'Sheet' + newSheetIndex;
		newSheet.attrib.sheetId = newSheetIndex;
		newSheet.attrib['r:id'] = 'rId' + newSheetIndex;

		let newRel = etree.SubElement(self.workbookRels, 'Relationship');
		newRel.attrib.Type = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet';
		newRel.attrib.Target = fileName;

		self._rebuild();
		/*TODO: work with 'definedNames'*/
		// let defn = etree.SubElement(self.workbook.find('definedNames'), 'definedName');
		return self;
	};

	/**
	 * Partially rebuild after copy/delete sheets.
	 *
	 * @private
	 */
	Workbook.prototype._rebuild = function () {
		/**
		 * each <sheet> 'r:id' attribute in '\xl\workbook.xml' must point to correct <Relationship> 'Id' in xl\_rels\workbook.xml.rels
		 * @type {exports}
		 */
		let self = this;
		let order = ['worksheet', 'theme', 'styles', 'sharedStrings'];

		self.workbookRels.findall('*')
			.sort(function (rel1, rel2) { //using order
				let index1 = order.indexOf(path.basename(rel1.attrib.Type));
				let index2 = order.indexOf(path.basename(rel2.attrib.Type));
				if ((index1 + index2) == 0)
					return rel1._id - rel2._id;
				return index1 - index2;
			})
			.forEach(function (item, index) {
				item.attrib.Id = 'rId' + (index + 1);
			});

		self.workbook.findall('sheets/sheet').forEach(function (item, index) {
			item.attrib['r:id'] = 'rId' + (index + 1);
			item.attrib.sheetId = (index + 1).toString();
		});

		self.archive.file(self.prefix + '/' + '_rels' + '/' + path.basename(self.workbookPath) + '.rels', etree.tostring(self.workbookRels));
		self.archive.file(self.workbookPath, etree.tostring(self.workbook));
		self.sheets = self.loadSheets(self.prefix, self.workbook, self.workbookRels);
	};

	/**
	 * Load a .xlsx file from a byte array.
	 *
	 * @param data
	 */
	Workbook.prototype.loadTemplate = function (data) {
		let self = this;

		if (Buffer.isBuffer(data)) {
			data = data.toString('binary');
		}

		self.archive = new zip(data, {base64: false, checkCRC32: true});

		/**
		 * Load relationships
		 */
		let rels = etree.parse(self.archive.file('_rels/.rels').asText()).getroot(),
			workbookPath = rels.find('Relationship[@Type=\'' + DOCUMENT_RELATIONSHIP + '\']').attrib.Target;

		self.workbookPath = workbookPath;
		self.prefix = path.dirname(workbookPath);
		self.workbook = etree.parse(self.archive.file(workbookPath).asText()).getroot();
		self.workbookRels = etree.parse(self.archive.file(self.prefix + '/' + '_rels' + '/' + path.basename(workbookPath) + '.rels').asText()).getroot();
		self.sheets = self.loadSheets(self.prefix, self.workbook, self.workbookRels);
		self.calChainRel = self.workbookRels.find('Relationship[@Type=\'' + CALC_CHAIN_RELATIONSHIP + '\']');

		if (self.calChainRel) {
			self.calcChainPath = self.prefix + '/' + self.calChainRel.attrib.Target;
			self.calcChain = etree.parse(self.archive.file(self.calcChainPath).asText()).getroot();
		}

		self.sharedStringsPath = self.prefix + '/' + self.workbookRels.find('Relationship[@Type=\'' + SHARED_STRINGS_RELATIONSHIP + '\']').attrib.Target;
		self.sharedStrings = [];
		etree.parse(self.archive.file(self.sharedStringsPath).asText()).getroot().findall('si').forEach(function (si) {
			let t = {text: ''};
			si.findall('t').forEach(function (tmp) {
				t.text += tmp.text;
			});
			si.findall('r/t').forEach(function (tmp) {
				t.text += tmp.text;
			});
			self.sharedStrings.push(t.text);
			self.sharedStringsLookup[t.text] = self.sharedStrings.length - 1;
		});
	};

	/**
	 * Interpolate values for the sheet with the given number (1-based) or
	 * name (if a string) using the given substitutions (an object).
	 *
	 * @param sheetName
	 * @param substitutions
	 */
	Workbook.prototype.substitute = function (sheetName, substitutions) {
		let self = this;

		let sheet = self.loadSheet(sheetName);

		let dimension = sheet.root.find('dimension'),
			sheetData = sheet.root.find('sheetData'),
			currentRow = null,
			totalRowsInserted = 0,
			totalColumnsInserted = 0,
			namedTables = self.loadTables(sheet.root, sheet.filename),
			rows = [];

		self.deleteCalcChainDataForSheet(sheet, self.calcChain);

		sheetData.findall('row').forEach(function (row) {
			row.attrib.r = currentRow = self.getCurrentRow(row, totalRowsInserted);
			rows.push(row);

			let cells = [],
				cellsInserted = 0,
				newTableRows = [];

			row.findall('c').forEach(function (cell) {
				let appendCell = true;
				cell.attrib.r = self.getCurrentCell(cell, currentRow, cellsInserted);

				/**
				 * Here we are forcing the values in formulas to be recalculated
				 */
				let formulas = cell.findall('f');
				if (formulas && formulas.length > 0) {
					cell.findall('v').forEach(function (v) {
						cell.remove(0, v);
					});
				}
				/**
				 * If c[@t='s'] (string column), look up /c/v@text as integer in `this.sharedStrings`
				 */
				if (cell.attrib.t === 's') {
					/**
					 * Look for a shared string that may contain placeholders
					 */
					let cellValue = cell.find('v'),
						stringIndex = parseInt(cellValue.text, 10),
						string = self.sharedStrings[stringIndex];
					if (string === undefined) {
						return;
					}
					/**
					 * Loop over placeholders
					 */
					self.extractPlaceholders(string).forEach(function (placeholder) {
						/**
						 * Only substitute things for which we have a substitution
						 */
						let substitution = substitutions[placeholder.name],
							newCellsInserted = 0;
						if (substitution === undefined) {
							substitution = '';
						}

						if (placeholder.full && placeholder.type === 'table' && substitution instanceof Array) {
							newCellsInserted = self.substituteTable(
								row, newTableRows,
								cells, cell,
								namedTables, substitution, placeholder.key
							);

							/**
							 * don't double-insert cells
							 */
							if (newCellsInserted !== 0 || substitution.length <= 0) { // TODO Исправляет косяк с 1 элементом массива
								appendCell = false;
							}

							/**
							 * Did we insert new columns (array values)?
							 */
							if (newCellsInserted !== 0) {
								appendCell = false; // don't double-insert cells
								cellsInserted += newCellsInserted;
								self.pushRight(self.workbook, sheet.root, cell.attrib.r, newCellsInserted);
							}
						} else if (placeholder.full && placeholder.type === 'normal' && substitution instanceof Array) {
							appendCell = false; // don't double-insert cells
							newCellsInserted = self.substituteArray(
								cells, cell, substitution
							);
							if (newCellsInserted !== 0) {
								cellsInserted += newCellsInserted;
								self.pushRight(self.workbook, sheet.root, cell.attrib.r, newCellsInserted);
							}
						} else {
							if (placeholder.key) {
								substitution = _get(substitutions, placeholder.name + '.' + placeholder.key);
							}
							string = self.substituteScalar(cell, string, placeholder, substitution);
						}
					});
				}
				/**
				 * if we are inserting columns, we may not want to keep the original cell anymore
				 */
				if (appendCell) {
					cells.push(cell);
				}
			}); // cells loop

			/**
			 * We may have inserted columns, so re-build the children of the row
			 */
			self.replaceChildren(row, cells);
			/**
			 * Update row spans attribute
			 */
			if (cellsInserted !== 0) {
				self.updateRowSpan(row, cellsInserted);
				if (cellsInserted > totalColumnsInserted) {
					totalColumnsInserted = cellsInserted;
				}
			}
			/**
			 * Add newly inserted rows
			 */
			if (newTableRows.length > 0) {
				newTableRows.forEach(function (r) {
					r = makeRowContinuous(r, row);//make row continuous, such as A2,B2,D2 -> A2,B2,C2,D2
					rows.push(r);
					++totalRowsInserted;
				});
				self.pushDown(self.workbook, sheet.root, namedTables, currentRow, newTableRows.length);
			}

			function makeRowContinuous(r, row) {
				let newRow = self.cloneElement(r, true);
				let cols = [];
				r._children.forEach(function (c) {
					cols.push(self.splitRef(c.attrib.r).col);
				});
				for (let i = 0; i < row._children.length; i++) {
					let cell = row._children[i];
					if (cell.attrib.s !== undefined) {
						let oCol = self.splitRef(cell.attrib.r).col;
						if (!contains(cols, oCol)) {
							let newCell = self.cloneElement(cell, false);
							newCell.attrib.r = self.joinRef({
								row: r.attrib.r,
								col: self.splitRef(newCell.attrib.r).col
							});
							newRow._children.splice(i, 0, newCell);
						}
					}
				}
				return newRow;
			}

			function contains(a, obj) {
				let i = a.length;
				while (i--) {
					if (a[i] === obj) {
						return true;
					}
				}
				return false;
			}
		}); // rows loop
		/**
		 * We may have inserted rows, so re-build the children of the sheetData
		 */
		self.replaceChildren(sheetData, rows);
		self.rebuildCalcChainForSheet(sheet, self.calcChain);
		/**
		 * Update placeholders in table column headers
		 */
		self.substituteTableColumnHeaders(namedTables, substitutions);
		/**
		 * Update <dimension /> if we added rows or columns
		 */
		if (dimension) {
			if (totalRowsInserted > 0 || totalColumnsInserted > 0) {
				let dimensionRange = self.splitRange(dimension.attrib.ref),
					dimensionEndRef = self.splitRef(dimensionRange.end);
				dimensionEndRef.row += totalRowsInserted;
				dimensionEndRef.col = self.numToChar(self.charToNum(dimensionEndRef.col) + totalColumnsInserted);
				dimensionRange.end = self.joinRef(dimensionEndRef);
				dimension.attrib.ref = self.joinRange(dimensionRange);
			}
		}
		/**
		 * Write back the modified XML trees
		 */
		self.archive.file(sheet.filename, etree.tostring(sheet.root));
		self.archive.file(self.workbookPath, etree.tostring(self.workbook));
		/**
		 * Remove calc chain - Excel will re-build, and we may have moved some formulae
		 */
		if (self.calcChainPath && self.archive.file(self.calcChainPath)) {
			self.archive.remove(self.calcChainPath);
		}
		self.writeSharedStrings();
		self.writeTables(namedTables);
	};
	/**
	 * Delete all calcChain references for a given sheet
	 */
	Workbook.prototype.deleteCalcChainDataForSheet = function (sheet, calcChain) {
		if (!calcChain) {
			return;
		}
		calcChain.findall('c').forEach(function (c) {
			//TODO: Revisit this - the if assumes each cell stores the sheet id in the c element, which is wrong - some cells have no i attrib.
			//      Having it always remove the tag no matter the sheet seems two work.
			// if (c.attrib.i == sheet.id){
			calcChain.remove(0, c);
			// }
		});
	};
	/**
	 * Rebuild all calcChain references at once. Not optimal as we could do inplace
	 * adjustments to the calcChain as cells are pushed down and right.
	 */
	Workbook.prototype.rebuildCalcChainForSheet = function (sheet, calcChain) {
		if (!calcChain) {
			return;
		}
		let self = this;
		let sheetData = sheet.root.find('sheetData');
		sheetData.findall('row').forEach(function (row) {
			row.findall('c').forEach(function (cell) {
				let formulas = cell.findall('f');
				if (formulas && formulas.length > 0) {
					let c = subElement(calcChain, 'c');
					c.attrib.r = cell.attrib.r;
					c.attrib.i = sheet.id;
					c.attrib.l = 1;
				}
			});
		});
		self.archive.file(self.calcChainPath, etree.tostring(calcChain));
	};
	/**
	 * Generate a new binary .xlsx file
	 */
	Workbook.prototype.generate = function (options) {
		let self = this;
		if (!options) {
			options = {
				base64: false/*,
				compression: 'DEFLATE'*/
			};
		}
		return self.archive.generate(options);
	};
	// Helpers
	/**
	 * Write back the new shared strings list
	 */
	Workbook.prototype.writeSharedStrings = function () {
		let self = this;
		let root = etree.parse(self.archive.file(self.sharedStringsPath).asText()).getroot(),
			children = root.getchildren();
		root.delSlice(0, children.length);
		self.sharedStrings.forEach(function (string) {
			let si = new etree.Element('si'),
				t = new etree.Element('t');
			t.text = string;
			si.append(t);
			root.append(si);
		});
		root.attrib.count = self.sharedStrings.length;
		root.attrib.uniqueCount = self.sharedStrings.length;
		self.archive.file(self.sharedStringsPath, etree.tostring(root));
	};
	/**
	 * Add a new shared string
	 *
	 * @param s
	 * @return {number}
	 */
	Workbook.prototype.addSharedString = function (s) {
		let self = this;
		let idx = self.sharedStrings.length;
		self.sharedStrings.push(s);
		self.sharedStringsLookup[s] = idx;
		return idx;
	};
	/**
	 * Get the number of a shared string, adding a new one if necessary.
	 *
	 * @param s
	 * @return {*}
	 */
	Workbook.prototype.stringIndex = function (s) {
		let self = this;
		let idx = self.sharedStringsLookup[s];
		if (idx === undefined) {
			idx = self.addSharedString(s);
		}
		return idx;
	};
	/**
	 * Replace a shared string with a new one at the same index. Return the index.
	 *
	 * @param oldString
	 * @param newString
	 * @return {*}
	 */
	Workbook.prototype.replaceString = function (oldString, newString) {
		let self = this;
		let idx = self.sharedStringsLookup[oldString];
		if (idx === undefined) {
			idx = self.addSharedString(newString);
		} else {
			self.sharedStrings[idx] = newString;
			delete self.sharedStringsLookup[oldString];
			self.sharedStringsLookup[newString] = idx;
		}
		return idx;
	};
	/**
	 * Get a list of sheet ids, names and filenames.
	 *
	 * @param prefix
	 * @param workbook
	 * @param workbookRels
	 * @return {Array}
	 */
	Workbook.prototype.loadSheets = function (prefix, workbook, workbookRels) {
		let sheets = [];
		workbook.findall('sheets/sheet').forEach(function (sheet) {
			let sheetId = sheet.attrib.sheetId,
				relId = sheet.attrib['r:id'],
				relationship = workbookRels.find('Relationship[@Id=\'' + relId + '\']'),
				filename = prefix + '/' + relationship.attrib.Target;
			sheets.push({
				id: parseInt(sheetId, 10),
				name: sheet.attrib.name,
				filename: filename
			});
		});
		return sheets;
	};
	/**
	 * Get sheet a sheet, including filename and name.
	 *
	 * @param sheet
	 * @return {{filename, name, id, root: *}}
	 */
	Workbook.prototype.loadSheet = function (sheet) {
		let self = this;
		let info = null;
		for (let i = 0; i < self.sheets.length; ++i) {
			if ((typeof(sheet) === 'number' && self.sheets[i].id === sheet) || (self.sheets[i].name === sheet)) {
				info = self.sheets[i];
				break;
			}
		}
		if (info === null) {
			throw new Error('Sheet ' + sheet + ' not found');
		}
		return {
			filename: info.filename,
			name: info.name,
			id: info.id,
			root: etree.parse(self.archive.file(info.filename).asText()).getroot()
		};
	};
	/**
	 * Load tables for a given sheet.
	 *
	 * @param sheet
	 * @param sheetFilename
	 * @return {Array}
	 */
	Workbook.prototype.loadTables = function (sheet, sheetFilename) {
		let self = this;
		let sheetDirectory = path.dirname(sheetFilename),
			sheetName = path.basename(sheetFilename),
			relsFilename = sheetDirectory + '/' + '_rels' + '/' + sheetName + '.rels',
			relsFile = self.archive.file(relsFilename),
			tables = []; // [{filename: ..., root: ....}]
		if (relsFile === null) {
			return tables;
		}
		let rels = etree.parse(relsFile.asText()).getroot();
		sheet.findall('tableParts/tablePart').forEach(function (tablePart) {
			let relationshipId = tablePart.attrib['r:id'],
				target = rels.find('Relationship[@Id=\'' + relationshipId + '\']').attrib.Target,
				tableFilename = target.replace('..', self.prefix),
				tableTree = etree.parse(self.archive.file(tableFilename).asText());
			tables.push({
				filename: tableFilename,
				root: tableTree.getroot()
			});
		});
		return tables;
	};
	/**
	 * Write back possibly-modified tables.
	 *
	 * @param tables
	 */
	Workbook.prototype.writeTables = function (tables) {
		let self = this;
		tables.forEach(function (namedTable) {
			self.archive.file(namedTable.filename, etree.tostring(namedTable.root));
		});
	};
	/**
	 * Perform substitution in table headers.
	 *
	 * @param tables
	 * @param substitutions
	 */
	Workbook.prototype.substituteTableColumnHeaders = function (tables, substitutions) {
		let self = this;
		let tableRange;
		tables.forEach(function (table) {
			let root = table.root,
				columns = root.find('tableColumns'),
				autoFilter = root.find('autoFilter'),
				idx = 0,
				inserted = 0,
				newColumns = [];

			tableRange = self.splitRange(root.attrib.ref);

			columns.findall('tableColumn').forEach(function (col) {
				++idx;
				col.attrib.id = Number(idx).toString();
				newColumns.push(col);
				let name = col.attrib.name;
				self.extractPlaceholders(name).forEach(function (placeholder) {
					let substitution = substitutions[placeholder.name];
					if (substitution === undefined) {
						return;
					}

					/**
					 * Array -> new columns
					 */
					if (placeholder.full && placeholder.type === 'normal' && substitution instanceof Array) {
						substitution.forEach(function (element, i) {
							let newCol = col;
							if (i > 0) {
								newCol = self.cloneElement(newCol);
								newCol.attrib.id = Number(++idx).toString();
								newColumns.push(newCol);
								++inserted;
								tableRange.end = self.nextCol(tableRange.end);
							}
							newCol.attrib.name = self.stringify(element);
						});
						/**
						 * Normal placeholder
						 */
					} else {
						name = name.replace(placeholder.placeholder, self.stringify(substitution));
						col.attrib.name = name;
					}
				});
			});

			self.replaceChildren(columns, newColumns);

			// Update range if we inserted columns
			if (inserted > 0) {
				columns.attrib.count = Number(idx).toString();
				root.attrib.ref = self.joinRange(tableRange);
				if (autoFilter !== null) {
					// XXX: This is a simplification that may stomp on some configurations
					autoFilter.attrib.ref = self.joinRange(tableRange);
				}
			}

			/**
			 * update ranges for totalsRowCount
			 */
			let tableRoot = table.root,
				tableStart = self.splitRef(tableRange.start),
				tableEnd = self.splitRef(tableRange.end);

			tableRange = self.splitRange(tableRoot.attrib.ref);

			if (tableRoot.attrib.totalsRowCount) {
				let autoFilter = tableRoot.find('autoFilter');
				if (autoFilter !== null) {
					autoFilter.attrib.ref = self.joinRange({
						start: self.joinRef(tableStart),
						end: self.joinRef(tableEnd)
					});
				}

				++tableEnd.row;
				tableRoot.attrib.ref = self.joinRange({
					start: self.joinRef(tableStart),
					end: self.joinRef(tableEnd)
				});

			}
		});
	};

	/**
	 * Return a list of tokens that may exist in the string.
	 * Keys are: `placeholder` (the full placeholder, including the `${}`
	 * delineators), `name` (the name part of the token), `key` (the object key
	 * for `table` tokens), `full` (boolean indicating whether this placeholder
	 * is the entirety of the string) and `type` (one of `table` or `cell`)
	 *
	 * @param string
	 * @return {Array}
	 */
	Workbook.prototype.extractPlaceholders = function (string) {
		/**
		 * Yes, that's right. It's a bunch of brackets and question marks and stuff.
		 *
		 * @type {RegExp}
		 */
		const re = /\${(?:(.+?):)?(.+?)(?:\.(.+?))?}/g;

		let match = null, matches = [];
		while ((match = re.exec(string)) !== null) {
			matches.push({
				placeholder: match[0],
				type: match[1] || 'normal',
				name: match[2],
				key: match[3],
				full: match[0].length === string.length
			});
		}

		return matches;
	};

	/**
	 * Split a reference into an object with keys `row` and `col` and, optionally, `table`, `rowAbsolute` and `colAbsolute`.
	 *
	 * @param ref
	 * @return {{table: *|null, colAbsolute: boolean, col: *, rowAbsolute: boolean, row: number}}
	 */
	Workbook.prototype.splitRef = function (ref) {
		let match = ref.match(/(?:(.+)!)?(\$)?([A-Z]+)(\$)?([0-9]+)/);
		return {
			table: match && match[1] || null,
			colAbsolute: Boolean(match && match[2]),
			col: match && match[3],
			rowAbsolute: Boolean(match && match[4]),
			row: parseInt(match && match[5], 10)
		};
	};

	/**
	 * Join an object with keys `row` and `col` into a single reference string.
	 *
	 * @param ref
	 * @return {string}
	 */
	Workbook.prototype.joinRef = function (ref) {
		return (ref.table ? ref.table + '!' : '') +
			(ref.colAbsolute ? '$' : '') +
			ref.col.toUpperCase() +
			(ref.rowAbsolute ? '$' : '') +
			Number(ref.row).toString();
	};

	/**
	 * Get the next column's cell reference given a reference like 'B2'.
	 *
	 * @param ref
	 * @return {string}
	 */
	Workbook.prototype.nextCol = function (ref) {
		let self = this;
		ref = ref.toUpperCase();
		return ref.replace(/[A-Z]+/, function (match) {
			return self.numToChar(self.charToNum(match) + 1);
		});
	};

	/**
	 * Get the next row's cell reference given a reference like 'B2'.
	 *
	 * @param ref
	 * @return {string}
	 */
	Workbook.prototype.nextRow = function (ref) {
		ref = ref.toUpperCase();
		return ref.replace(/[0-9]+/, function (match) {
			return (parseInt(match, 10) + 1).toString();
		});
	};

	/**
	 * Turn a reference like 'AA' into a number like 27.
	 *
	 * @param str
	 * @return {number}
	 */
	Workbook.prototype.charToNum = function (str) {
		let num = 0;
		for (let idx = str.length - 1, iteration = 0; idx >= 0; --idx, ++iteration) {
			let thisChar = str.charCodeAt(idx) - 64, // A -> 1; B -> 2; ... Z->26
				multiplier = Math.pow(26, iteration);
			num += multiplier * thisChar;
		}
		return num;
	};

	/**
	 * Turn a number like 27 into a reference like 'AA'.
	 *
	 * @param num
	 * @return {string}
	 */
	Workbook.prototype.numToChar = function (num) {
		let str = '';

		for (let i = 0; num > 0; ++i) {
			let remainder = num % 26,
				charCode = remainder + 64;
			num = (num - remainder) / 26;

			/**
			 * Compensate for the fact that we don't represent zero, e.g. A = 1, Z = 26, but AA = 27.
			 */
			if (remainder === 0) { // 26 -> Z
				charCode = 90;
				--num;
			}

			str = String.fromCharCode(charCode) + str;
		}
		return str;
	};

	/**
	 * Is ref a range?
	 *
	 * @param ref
	 * @return {boolean}
	 */
	Workbook.prototype.isRange = function (ref) {
		return ref.indexOf(':') !== -1;
	};

	/**
	 * Is ref inside the table defined by startRef and endRef?
	 *
	 * @param ref
	 * @param startRef
	 * @param endRef
	 * @return {boolean}
	 */
	Workbook.prototype.isWithin = function (ref, startRef, endRef) {
		let self = this;

		let start = self.splitRef(startRef),
			end = self.splitRef(endRef),
			target = self.splitRef(ref);

		start.col = self.charToNum(start.col);
		end.col = self.charToNum(end.col);
		target.col = self.charToNum(target.col);

		return (
			start.row <= target.row && target.row <= end.row &&
			start.col <= target.col && target.col <= end.col
		);

	};

	/**
	 * Turn a value of any type into a string.
	 *
	 * @param value
	 * @return {*}
	 */
	Workbook.prototype.stringify = function (value) {
		if (value instanceof Date) {
			//In Excel date is a number of days since 01/01/1900
			//           timestamp in ms    to days      + number of days from 1900 to 1970
			return Number((value.getTime() / (1000 * 60 * 60 * 24)) + 25569);
		} else if (typeof(value) === 'number' || typeof(value) === 'boolean') {
			return Number(value).toString();
		} else if (typeof(value) === 'string') {
			return String(value).toString();
		}

		return '';
	};

	/**
	 * Insert a substitution value into a cell (c tag).
	 *
	 * @param cell
	 * @param substitution
	 * @return {*}
	 */
	Workbook.prototype.insertCellValue = function (cell, substitution) {
		let self = this;

		let cellValue = cell.find('v'),
			stringified = self.stringify(substitution);

		if (typeof(substitution) === 'number' || substitution instanceof Date) {
			delete cell.attrib.t;
			cellValue.text = stringified;
		} else if (typeof(substitution) === 'boolean') {
			cell.attrib.t = 'b';
			cellValue.text = stringified;
		} else {
			cell.attrib.t = 's';
			cellValue.text = Number(self.stringIndex(stringified)).toString();
		}
		return stringified;
	};

	/**
	 * Perform substitution of a single value.
	 *
	 * @param cell
	 * @param string
	 * @param placeholder
	 * @param substitution
	 * @return {*}
	 */
	Workbook.prototype.substituteScalar = function (cell, string, placeholder, substitution) {
		let self = this;

		if (placeholder.full && typeof(substitution) === 'string') {
			self.replaceString(string, substitution);
		}

		if (placeholder.full) {
			return self.insertCellValue(cell, substitution);
		} else {
			let newString = string.replace(placeholder.placeholder, self.stringify(substitution));
			cell.attrib.t = 's';
			self.replaceString(string, newString);
			return newString;
		}

	};

	/**
	 * Perform a columns substitution from an array.
	 *
	 * @param cells
	 * @param cell
	 * @param substitution
	 * @return {number}
	 */
	Workbook.prototype.substituteArray = function (cells, cell, substitution) {
		let self = this;

		let newCellsInserted = -1, // we technically delete one before we start adding back
			currentCell = cell.attrib.r;

		/**
		 * add a cell for each element in the list
		 */
		substitution.forEach(function (element) {
			++newCellsInserted;

			if (newCellsInserted > 0) {
				currentCell = self.nextCol(currentCell);
			}

			let newCell = self.cloneElement(cell);
			self.insertCellValue(newCell, element);

			newCell.attrib.r = currentCell;
			cells.push(newCell);
		});

		return newCellsInserted;
	};

	/**
	 * Perform a table substitution. May update `newTableRows` and `cells` and change `cell`.
	 * Returns total number of new cells inserted on the original row.
	 *
	 * @param row
	 * @param newTableRows
	 * @param cells
	 * @param cell
	 * @param namedTables
	 * @param substitution
	 * @param key
	 * @return {number}
	 */
	Workbook.prototype.substituteTable = function (row, newTableRows, cells, cell, namedTables, substitution, key) {
		let self = this,
			newCellsInserted = 0; // on the original row

		/**
		 * if no elements, blank the cell, but don't delete it
		 */
		if (substitution.length === 0) {
			delete cell.attrib.t;
			self.replaceChildren(cell, []);
		} else {

			let parentTables = namedTables.filter(function (namedTable) {
				let range = self.splitRange(namedTable.root.attrib.ref);
				return self.isWithin(cell.attrib.r, range.start, range.end);
			});

			substitution.forEach(function (element, idx) {
				let newRow, newCell,
					newCellsInsertedOnNewRow = 0,
					newCells = [],
					value = element[key];

				if (idx === 0) { // insert in the row where the placeholders are
					if (value instanceof Array) {
						newCellsInserted = self.substituteArray(cells, cell, value);
					} else {
						self.insertCellValue(cell, value);
					}
				} else { // insert new rows (or reuse rows just inserted)
					/**
					 * Do we have an existing row to use? If not, create one.
					 */
					if ((idx - 1) < newTableRows.length) {
						newRow = newTableRows[idx - 1];
					} else {
						newRow = self.cloneElement(row, false);
						newRow.attrib.r = self.getCurrentRow(row, newTableRows.length + 1);
						newTableRows.push(newRow);
					}

					/**
					 * Create a new cell.
					 *
					 * @type {*}
					 */
					newCell = self.cloneElement(cell);
					newCell.attrib.r = self.joinRef({
						row: newRow.attrib.r,
						col: self.splitRef(newCell.attrib.r).col
					});

					if (value instanceof Array) {
						newCellsInsertedOnNewRow = self.substituteArray(newCells, newCell, value);

						/**
						 * Add each of the new cells created by substituteArray()
						 */
						newCells.forEach(function (newCell) {
							newRow.append(newCell);
						});

						self.updateRowSpan(newRow, newCellsInsertedOnNewRow);
					} else {
						self.insertCellValue(newCell, value);

						/**
						 * Add the cell that previously held the placeholder
						 */
						newRow.append(newCell);
					}

					/**
					 * expand named table range if necessary
					 */
					parentTables.forEach(function (namedTable) {
						let tableRoot = namedTable.root,
							autoFilter = tableRoot.find('autoFilter'),
							range = self.splitRange(tableRoot.attrib.ref);

						if (!self.isWithin(newCell.attrib.r, range.start, range.end)) {
							range.end = self.nextRow(range.end);
							tableRoot.attrib.ref = self.joinRange(range);
							if (autoFilter !== null) {
								// XXX: This is a simplification that may stomp on some configurations
								autoFilter.attrib.ref = tableRoot.attrib.ref;
							}
						}
					});
				}
			});
		}

		return newCellsInserted;
	};

	/**
	 * Clone an element. If `deep` is true, recursively clone children.
	 *
	 * @param element
	 * @param deep
	 * @return {*}
	 */
	Workbook.prototype.cloneElement = function (element, deep) {
		let self = this;

		let newElement = etree.Element(element.tag, element.attrib);
		newElement.text = element.text;
		newElement.tail = element.tail;

		if (deep !== false) {
			element.getchildren().forEach(function (child) {
				newElement.append(self.cloneElement(child, deep));
			});
		}

		return newElement;
	};

	/**
	 * Replace all children of `parent` with the nodes in the list `children`.
	 *
	 * @param parent
	 * @param children
	 */
	Workbook.prototype.replaceChildren = function (parent, children) {
		parent.delSlice(0, parent.len());
		children.forEach(function (child) {
			parent.append(child);
		});
	};

	/**
	 * Calculate the current row based on a source row and a number of new rows that have been inserted above.
	 *
	 * @param row
	 * @param rowsInserted
	 * @return {*}
	 */
	Workbook.prototype.getCurrentRow = function (row, rowsInserted) {
		return parseInt(row.attrib.r, 10) + rowsInserted;
	};

	/**
	 * Calculate the current cell based on asource cell, the current row index, and a number of new cells that have been inserted so far.
	 *
	 * @param cell
	 * @param currentRow
	 * @param cellsInserted
	 * @return {string}
	 */
	Workbook.prototype.getCurrentCell = function (cell, currentRow, cellsInserted) {
		let self = this;

		let colRef = self.splitRef(cell.attrib.r).col,
			colNum = self.charToNum(colRef);

		return self.joinRef({
			row: currentRow,
			col: self.numToChar(colNum + cellsInserted)
		});
	};

	/**
	 * Adjust the row `spans` attribute by `cellsInserted`.
	 *
	 * @param row
	 * @param cellsInserted
	 */
	Workbook.prototype.updateRowSpan = function (row, cellsInserted) {
		if (cellsInserted !== 0 && row.attrib.spans) {
			let rowSpan = row.attrib.spans.split(':').map(function (f) {
				return parseInt(f, 10);
			});
			rowSpan[1] += cellsInserted;
			row.attrib.spans = rowSpan.join(':');
		}
	};

	/**
	 * Split a range like 'A1:B1' into {start: 'A1', end: 'B1'}.
	 *
	 * @param range
	 * @return {{start: *|string, end: *|string}}
	 */
	Workbook.prototype.splitRange = function (range) {
		let split = range.split(':');
		return {
			start: split[0],
			end: split[1]
		};
	};

	/**
	 * Join into a a range like 'A1:B1' an object like {start: 'A1', end: 'B1'}.
	 *
	 * @param range
	 * @return {string}
	 */
	Workbook.prototype.joinRange = function (range) {
		return range.start + ':' + range.end;
	};

	/**
	 * Look for any merged cell or named range definitions to the right of `currentCell` and push right by `numCols`.
	 *
	 * @param workbook
	 * @param sheet
	 * @param currentCell
	 * @param numCols
	 */
	Workbook.prototype.pushRight = function (workbook, sheet, currentCell, numCols) {
		let self = this;

		let cellRef = self.splitRef(currentCell),
			currentRow = cellRef.row,
			currentCol = self.charToNum(cellRef.col);

		/**
		 * Update merged cells on the same row, at a higher column
		 */
		sheet.findall('mergeCells/mergeCell').forEach(function (mergeCell) {
			let mergeRange = self.splitRange(mergeCell.attrib.ref),
				mergeStart = self.splitRef(mergeRange.start),
				mergeStartCol = self.charToNum(mergeStart.col),
				mergeEnd = self.splitRef(mergeRange.end),
				mergeEndCol = self.charToNum(mergeEnd.col);

			if (mergeStart.row === currentRow && currentCol < mergeStartCol) {
				mergeStart.col = self.numToChar(mergeStartCol + numCols);
				mergeEnd.col = self.numToChar(mergeEndCol + numCols);

				mergeCell.attrib.ref = self.joinRange({
					start: self.joinRef(mergeStart),
					end: self.joinRef(mergeEnd)
				});
			}
		});

		/**
		 * Named cells/ranges
		 */
		workbook.findall('definedNames/definedName').forEach(function (name) {
			let ref = name.text;

			if (self.isRange(ref)) {
				let namedRange = self.splitRange(ref),
					namedStart = self.splitRef(namedRange.start),
					namedStartCol = self.charToNum(namedStart.col),
					namedEnd = self.splitRef(namedRange.end),
					namedEndCol = self.charToNum(namedEnd.col);

				if (namedStart.row === currentRow && currentCol < namedStartCol) {
					namedStart.col = self.numToChar(namedStartCol + numCols);
					namedEnd.col = self.numToChar(namedEndCol + numCols);

					name.text = self.joinRange({
						start: self.joinRef(namedStart),
						end: self.joinRef(namedEnd)
					});
				}
			} else {
				let namedRef = self.splitRef(ref),
					namedCol = self.charToNum(namedRef.col);

				if (namedRef.row === currentRow && currentCol < namedCol) {
					namedRef.col = self.numToChar(namedCol + numCols);

					name.text = self.joinRef(namedRef);
				}
			}

		});
	};

	/**
	 * Look for any merged cell, named table or named range definitions below `currentRow` and push down by `numRows` (used when rows are inserted).
	 *
	 * @param workbook
	 * @param sheet
	 * @param tables
	 * @param currentRow
	 * @param numRows
	 */
	Workbook.prototype.pushDown = function (workbook, sheet, tables, currentRow, numRows) {
		let self = this;

		let mergeCells = sheet.find('mergeCells');
		/**
		 * Update merged cells below this row
		 */
		sheet.findall('mergeCells/mergeCell').forEach(function (mergeCell) {
			let mergeRange = self.splitRange(mergeCell.attrib.ref),
				mergeStart = self.splitRef(mergeRange.start),
				mergeEnd = self.splitRef(mergeRange.end);

			if (mergeStart.row > currentRow) {
				mergeStart.row += numRows;
				mergeEnd.row += numRows;

				mergeCell.attrib.ref = self.joinRange({
					start: self.joinRef(mergeStart),
					end: self.joinRef(mergeEnd)
				});

			}

			/**
			 * add new merge cell
			 */
			if (mergeStart.row == currentRow) {
				for (let i = 1; i <= numRows; i++) {
					let newMergeCell = self.cloneElement(mergeCell);
					mergeStart.row += 1;
					mergeEnd.row += 1;
					newMergeCell.attrib.ref = self.joinRange({
						start: self.joinRef(mergeStart),
						end: self.joinRef(mergeEnd)
					});
					mergeCells.attrib.count += 1;
					mergeCells._children.push(newMergeCell);
				}
			}
		});

		/**
		 * Update named tables below this row
		 */
		tables.forEach(function (table) {
			let tableRoot = table.root,
				tableRange = self.splitRange(tableRoot.attrib.ref),
				tableStart = self.splitRef(tableRange.start),
				tableEnd = self.splitRef(tableRange.end);


			if (tableStart.row > currentRow) {
				tableStart.row += numRows;
				tableEnd.row += numRows;

				tableRoot.attrib.ref = self.joinRange({
					start: self.joinRef(tableStart),
					end: self.joinRef(tableEnd)
				});

				let autoFilter = tableRoot.find('autoFilter');
				if (autoFilter !== null) {
					// XXX: This is a simplification that may stomp on some configurations
					autoFilter.attrib.ref = tableRoot.attrib.ref;
				}
			}
		});

		/**
		 * Named cells/ranges
		 */
		workbook.findall('definedNames/definedName').forEach(function (name) {
			let ref = name.text;

			if (self.isRange(ref)) {
				let namedRange = self.splitRange(ref),
					namedStart = self.splitRef(namedRange.start),
					namedEnd = self.splitRef(namedRange.end);

				if (namedStart) {
					if (namedStart.row > currentRow) {
						namedStart.row += numRows;
						namedEnd.row += numRows;

						name.text = self.joinRange({
							start: self.joinRef(namedStart),
							end: self.joinRef(namedEnd)
						});

					}
				}
			} else {
				let namedRef = self.splitRef(ref);

				if (namedRef.row > currentRow) {
					namedRef.row += numRows;
					name.text = self.joinRef(namedRef);
				}
			}

		});
	};

	return Workbook;
})();
