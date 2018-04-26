# CCBWQA Portal Documentation
This guide provides the ins and outs of the different water quality data import components of the CCBWQA Data Portal. Focus is given to both the website interface as well as the database.

* [Data Import Process](#dataimportprocess)
* [Pending Records Review](#pendingrecordsreview)
* [Deleting Records](#deletingrecords)
* [Add New List Value to Database Interface](#addnewlistvaluetodatabaseinterface)

## Data Import Process

The data import process follows this general workflow:

1. The user uploads a CSV filed named ccbwq_data.csv to Dropbox at [http://ccbwqportal.org/data\_import](http://ccbwqportal.org/data\_import).
2. The user then clicks the <b>Import Data</b> to import the data.
3. The user is redirected to a page where they can review key fields where values could not be matched with existing records in the database.
4. The user either associates the flagged values with existing values or elects to add them as new values.

### IMPORTANT CONSIDERATIONS

* Need to add "imported by" and import_description" fields to the data import page and log landing table
* When adding a new method will need to factor in that we will need to associate it with a methodtypeid
* When inserting records to the master results table, will also need to insert into all required assoc tables such as results_to_methods and results_to_flags
* Need to figure out how the sourceid will be set when inserting into the AKA tables


### Website Interface

The website interface is a simple page with two buttons and a table. The button titled <b>Upload CSV</b> opens a new tab that allows the user to upload their CSV to Dropbox. The second button, titled, <b>Import Data</b> starts the data import process in the database. The table provides a summary of the last data import.

### Database Structures

#### Import CSV

The first step of the import process is to import the uploaded CSV file. When the user clicks the <b>Import Data</b> it calls the function <b>data\_import.import\_csv()</b> which can be found below. The function deletes all data from the landing table before fetching the uploaded CSV from Dropbox and importing it into the landing table. THe function then creates a record in the import log table and sets the import\_ndx for every record in the landing table to the import\_ndx that was just created. Lastly, the function deletes the uploaded CSV file.

```SQL
DELETE FROM data_import.landing_table;
COPY data_import.landing_table (collect_date, collect_time, location_name, depth_value, 
       depth_units, characteristic, fraction, speciation, result_value, 
       result_units, matrix, method, qualifier, mdl, mdl_units, pql, 
       pql_units, flow_condition, lab, lab_id, project_id, department_name, 
       received_date, analyzed_date, analyst, cas, comments ) FROM '/home/dropboxer/Dropbox/AutomatedDataImport/WY2018WaterQualityData/CCBWQ Portal - ccbwq_data.csv' DELIMITER ',' CSV HEADER;

INSERT INTO data_import.import_log(import_date) VALUES (NOW());
UPDATE data_import.landing_table SET import_ndx = r.import_ndx FROM
(SELECT MAX(import_ndx) AS import_ndx FROM data_import.import_log) r;

COPY (SELECT 1) TO PROGRAM 'rm /home/dropboxer/Dropbox/AutomatedDataImport/WY2018WaterQualityData/*.*';

```

#### Check for New Values

The purpose of the check\_values function is to flag any values for key index fields where a match could not be found. If a match cannot be found, the value as well as the record\_ndx and associated import\_ndx are inserted into a pending landing table. The table below details the key index fields and their associated landing tables.

| Key Index Tables                | Landing Tables                      |
| ------------------------------  |:-----------------------------------:|
| data.list_locations             | dataentry.pending\_locations        |
| data.list_parameters            | dataentry.pending\_parameters       |
| data.list_units                 | dataentry.pending\_units            |
| data.list_matrix                | dataentry.pending\_matrixes         |
| data.list_methods               | dataentry.pending\_methods          |
| data.list_flags                 | dataentry.pending_flags             |
| data.list_labs                  | dataentry.pending_labs              |
| data.list\_flow_conditions      | dataentry.pending\_flow_conditions  |
| data.list\_ccb\_depthcategories | dataentry.pending\_depth_categories |

After every key index field has been checked, the function examines all of the pending tables stores a distinct list of record\_ndxs found in the pending tables. The pending\_flag for the records in this list are all then marked as TRUE. This list of record_ndxs is then used to push these records to a pending results table. The remaining records from the landing table (records where a match for all key index fields could be found) are pushed to the master results table. After all of the results have either been pushed to the pending results table or the master results table, the landing table is emptied.

## Pending Records Review

After importing data, the user is redirected to [http://ccwcd2.org/Central/wq\_data_review](http://ccwcd2.org/Central/wq\_data_review) to review the location, units, parameters, and methods for which a match could not be found. The user can then associate the flagged value with a value from the respective existing list tables if it exists. Common examples of this would be differences in spelling or capitalization. 

If the value truly is a new value not seen in the database before, the user can then use the <b>Add New Value</b> pages to add it to the database and then return to the pending values page and associate it with the newly added value.

After a user has associated a flagged value with an existing one in the database, a post-submit function runs to check each record in the pending results table to see if a match for each key index field has been found. Records where a match has been found are then pushed to the master results table (<b>data.data</b>).

### Website Interface

The website interfaces consists of a Fetchit egrid for flagged values for structures, units, parameters, and methods. When each egrid is submitted, a post-submit function associated with the form is called that creates the associations between the flagged values and existing list values.

### Database Structures

The following table details the landing tables and post-submit functions for each Fetchit egrid.

| List Type        | Landing Tables                      | Post-Submit Function                           |
| ---------------- |:-----------------------------------:| ----------------------------------------------:|
| Structures       | dataentry.pending\_structures_egrid | dataentry.load\_pending\_wq\_data_structures() |
| Parameters       | dataentry.pending\_parameters_egrid | dataentry.load\_pending\_wq\_data_parameters() |
| Units            | dataentry.pending\_units_egrid      | dataentry.load\_pending\_wq\_data_units()      |
| Methods          | dataentry.pending\_methods_egrid    | dataentry.load\_pending\_wq\_data_methods()    |

Each post-submit function follows a similiar logic.

1. Insert associated value into related aka table.
2. Re-check flagged records to determine if matches can be found for structure, unit, parameter, and method. Insert records into master results table where this evaluates to true.
3. Clear records out records inserted into master results table from pending results table.
4. Clear associated records from egrids. 

```SQL
/* ===============================================================================
STEP 1 - Identify pending entities and insert new associations into aka tables
=================================================================================*/

/* 1.1 Insert associated structures into list_structures_aka */
INSERT INTO data.list_structures_aka(structure_ndx, structure_text_src)
SELECT structure_ndx, structure_text_src FROM dataentry.associated_pending_structures_staging;

/* ===============================================================================
STEP 2 - Insert pending records that are now associated into results table
=================================================================================*/

INSERT INTO data.data (structure_ndx, obs_date, parameter_ndx, val, lab_ndx, flag, remark, ndflag, import_ndx, labno, unit_ndx, method_ndx, dl_val, dl_unit_ndx)
SELECT	r.structure_ndx,
	r.obs_date,
	r.parameter_ndx,
	r.val::real,
	r.lab_ndx,
	r.flag,
	r.remark,
	r.ndflag,
	r.import_ndx,
	r.labno,
	r.unit_ndx,
	r.method_ndx,
	r.dl_val,
	r.dl_unit_ndx	
FROM dataentry.associated_pending_results_staging r
WHERE r.structure_ndx IS NOT NULL and r.parameter_ndx IS NOT NULL AND r.unit_ndx IS NOT NULL AND r.method_ndx IS NOT NULL;

/* ===============================================================================
STEP 3 - Clear associated pending records from pending_results_table
=================================================================================*/

DELETE FROM dataentry.pending_results WHERE record_ndx IN
(SELECT record_ndx FROM dataentry.associated_pending_results_staging);

/* ===============================================================================
STEP 3 - Clear associated records from egrids
=================================================================================*/

DELETE FROM dataentry.pending_structures_egrid WHERE pending_structure_ndx IN 
(SELECT pending_structure_ndx FROM dataentry.associated_pending_structures_staging);
```


## Deleting Records

The Delete Records interface can be found at [http://ccwcd2.org/Central/wq\_data_delete](http://ccwcd2.org/Central/wq\_data_delete). The interface allows users to return all records for a selected date and then select which records to delete using a Fetchit table with checkboxes.

### Website Interface

The website interface consists of two Fetchit forms, one to select a date for database records to return, and a second to select which records to delete. A post-submit function is called when the user submits the Fetchit table form.

### Database Structures
  
| Fetchit Block | Landing Tables                               | Post-Submit Function                 |
| ------------- |:--------------------------------------------:| ------------------------------------:|
| Date Select   | dataentry.delete\_data_datepicker            | none                                 |
| Table Form    | dataentry.delete\_data\_selected\_result_ndx | dataentry.delete\_selected_records() |

After the user selects which records they would like to delete, a post-submit function runs that deletes the selected records from the database. The function is very straightforward.

```SQL
DELETE FROM data.data WHERE result_ndx IN (
SELECT r.result_ndx FROM dataentry.delete_data_selected_result_ndx r);
```


## Add New List Value to Database Interface

As CCWCD moved away from managing their water quality data in an Microsoft Access DB, it became important to provide them with a way to add new values to their list tables (owners, structures, parameters, methods, and units).

### Website Interface

New owners and structures can be added to their respective list tables at [http://ccwcd2.org/Central/wq\_add_new](http://ccwcd2.org/Central/wq\_add_new). In addition to adding new owners and structures, the user can scrolldown to the bottom of the page to view existing owners, structures, structure types, and measurement sources.

The same paradigm applies for adding new parameters, units, and methods. These can be added at [http://ccwcd2.org/Central/wq\_add\_new_secondary](http://ccwcd2.org/Central/wq\_add\_new_secondary).

Fetchit parameter input forms are used in all cases to write values to the database, calling a post-submit function. 

### Database Structures

The landing tables for the Fetchit forms are all found in the <b>dataentry</b> schema of the database. Here is a landing table prefix guide for each Fetchit form:

| List Type        | Landing Tables          | Post-Submit Function          |
| ---------------- |:-----------------------:| -----------------------------:|
| Owners           | dataentry.owners_*      | dataentry.add\_new_owner()     |
| Structures       | dataentry.structures_* | dataentry.add\_new_structure() |
| Parameters       | dataentry.parameters_*  | dataentry.add\_new_parameter() |
| Units            | dataentry.units_*       | dataentry.add\_new_unit()      |
| Methods          | dataentry.methods_*     | dataentry.add\_new_method()    |

#### Breakdown of What Each Post-Submit Does

Each post-submit function generally does the following:

1. Insert new value into respective list table if value doesn't already exist
2. Insert new value into respective list aka table
3. Insert association between new list value and group if assoc table exists for the list table
4. Delete from landing tables

```SQL

/* First step is to insert new parameter into list_parameters if it doens't already exist */
INSERT INTO data.list_parameters (parameter_code,parameter_name,parameter_type_ndx,param_units)
SELECT  a.parameter_code::text,
	b.parameter_name::text,
	c.parameter_type_ndx::integer,
	d.param_units::integer
FROM dataentry.parameters_parameter_code a
CROSS JOIN (SELECT a.parameter_name FROM dataentry.parameters_parameter_name a) b
CROSS JOIN (SELECT a.parameter_type_ndx FROM dataentry.parameters_parameter_type_ndx a) c
CROSS JOIN (SELECT a.param_units FROM dataentry.parameters_param_units a) d;

/* Next, insert new parameter into list_parameters_aka */
INSERT INTO data.list_parameters_aka (parameter_ndx, parameter_text_src)
SELECT  p.parameter_ndx, 
	p.parameter_name
FROM data.list_parameters p
LEFT JOIN data.list_parameters_aka pa USING (parameter_ndx)
WHERE pa.parameter_aka_ndx IS NULL
ORDER BY 1 DESC LIMIT 1;

/* Insert the parameter to parameter type association into the assoc table */
INSERT INTO data.list_parameters_to_types (parameter_type_ndx, parameter_ndx)
SELECT  c.parameter_type_ndx,
	pp.parameter_ndx
FROM data.list_parameters pp
JOIN (SELECT a.parameter_code FROM dataentry.parameters_parameter_code a) a ON 
		COALESCE(a.parameter_code,'NA') = COALESCE(pp.parameter_code,'NA')
JOIN (SELECT a.parameter_name FROM dataentry.parameters_parameter_name a) b ON 
		BTRIM(LOWER(b.parameter_name)) = BTRIM(LOWER(pp.parameter_name))
JOIN (SELECT a.parameter_type_ndx FROM dataentry.parameters_parameter_type_ndx a) c ON 
		c.parameter_type_ndx = pp.parameter_type_ndx
JOIN (SELECT a.param_units FROM dataentry.parameters_param_units a) d ON 
		d.param_units = pp.param_units
ORDER BY 1 DESC LIMIT 1;

/* Lastly, clear out landing tables */
DELETE FROM dataentry.parameters_parameter_code;
DELETE FROM dataentry.parameters_parameter_name;
DELETE FROM dataentry.parameters_parameter_type_ndx;
DELETE FROM dataentry.parameters_param_units;
```
