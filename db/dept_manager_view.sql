USE `employees`;
CREATE  OR REPLACE VIEW `dept_manager_view` AS
    SELECT 
        `dept_manager`.`emp_no` AS `emp_no`,
        `dept_manager`.`dept_no` AS `dept_no`,
        `dept_manager`.`from_date` AS `from_date`,
        `dept_manager`.`to_date` AS `to_date`,
        `departments`.`dept_name` AS `dept_name`,
        `employees`.`first_name` AS `first_name`,
        `employees`.`last_name` AS `last_name`,
        `employees`.`gender` AS `gender`,
        `employees`.`hire_date` AS `hire_date`,
        `employees`.`birth_date` AS `birth_date`
    FROM
        ((`dept_manager`
        LEFT JOIN `departments` ON ((`dept_manager`.`dept_no` = `departments`.`dept_no`)))
        LEFT JOIN `employees` ON ((`dept_manager`.`emp_no` = `employees`.`emp_no`)));

		
CREATE  OR REPLACE VIEW `dept_emp_view` AS
    SELECT 
        `dept_emp`.`emp_no` AS `emp_no`,
        `dept_emp`.`dept_no` AS `dept_no`,
        `dept_emp`.`from_date` AS `from_date`,
        `dept_emp`.`to_date` AS `to_date`,
        `departments`.`dept_name` AS `dept_name`,
        `employees`.`first_name` AS `first_name`,
        `employees`.`last_name` AS `last_name`,
        `employees`.`gender` AS `gender`,
        `employees`.`hire_date` AS `hire_date`,
        `employees`.`birth_date` AS `birth_date`
    FROM
        ((`dept_emp`
        LEFT JOIN `departments` ON ((`dept_emp`.`dept_no` = `departments`.`dept_no`)))
        LEFT JOIN `employees` ON ((`dept_emp`.`emp_no` = `employees`.`emp_no`)));
		