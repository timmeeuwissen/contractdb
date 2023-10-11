-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema contractdb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `contractdb` ;

-- -----------------------------------------------------
-- Schema contractdb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `contractdb` DEFAULT CHARACTER SET utf8mb3 ;
USE `contractdb` ;

-- -----------------------------------------------------
-- Table `contractdb`.`costDrivers`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`costDrivers` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`costDrivers` (
  `costDriverId` INT NOT NULL AUTO_INCREMENT,
  `costDriver` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`costDriverId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`ITVMers`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`ITVMers` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`ITVMers` (
  `ITVMId` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`ITVMId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`ITVMCategories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`ITVMCategories` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`ITVMCategories` (
  `ITVMCategoryId` INT NOT NULL AUTO_INCREMENT,
  `ITVMParentCategoryId` INT NULL DEFAULT NULL,
  `category` VARCHAR(45) NULL DEFAULT NULL,
  `defaultITVMId` INT NULL DEFAULT NULL,
  PRIMARY KEY (`ITVMCategoryId`),
  INDEX `defaultITVMId_fk_idx` (`defaultITVMId` ASC) VISIBLE,
  CONSTRAINT `defaultITVMId_fk`
    FOREIGN KEY (`defaultITVMId`)
    REFERENCES `contractdb`.`ITVMers` (`ITVMId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`SDMers`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`SDMers` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`SDMers` (
  `SDMId` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`SDMId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`billingSystems`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`billingSystems` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`billingSystems` (
  `billingSystemId` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`billingSystemId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`budgetType`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`budgetType` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`budgetType` (
  `budgetTypeId` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`budgetTypeId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`vendors`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`vendors` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`vendors` (
  `vendorId` INT NOT NULL AUTO_INCREMENT,
  `parentVendorId` INT NULL DEFAULT NULL,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`vendorId`),
  INDEX `parentVendorId_idx` (`parentVendorId` ASC) VISIBLE,
  CONSTRAINT `parentVendorId`
    FOREIGN KEY (`parentVendorId`)
    REFERENCES `contractdb`.`vendors` (`vendorId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`domains`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`domains` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`domains` (
  `domainId` INT NOT NULL AUTO_INCREMENT,
  `domain` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`domainId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`stakeholders`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`stakeholders` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`stakeholders` (
  `StakeholderId` INT NOT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`StakeholderId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`contracts`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`contracts` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`contracts` (
  `ContractId` INT NOT NULL,
  `xECM code` INT NULL DEFAULT NULL,
  `budgetTypeId` INT NULL DEFAULT NULL,
  `active` TINYINT NOT NULL,
  `vendorId` INT NOT NULL,
  `billingSystemId` INT NULL DEFAULT NULL,
  `domainId` INT NULL DEFAULT NULL,
  `itvmCategoryId` INT NULL DEFAULT NULL,
  `scope` VARCHAR(254) NULL DEFAULT NULL,
  `costDriverId` INT NULL DEFAULT NULL,
  `noticePeriodInMonths` INT NULL DEFAULT NULL,
  `contractStartDate` DATE NULL DEFAULT NULL,
  `contractEndDate` DATE NULL DEFAULT NULL,
  `SDMId` INT NULL DEFAULT NULL,
  `ITVMId` INT NULL DEFAULT NULL,
  `stakeholderId` INT NULL DEFAULT NULL,
  `invoiceCode` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`ContractId`),
  INDEX `vendorId_idx` (`vendorId` ASC) VISIBLE,
  INDEX `domainId_fk_idx` (`domainId` ASC) VISIBLE,
  INDEX `itvmCategoryId_fk_idx` (`itvmCategoryId` ASC) VISIBLE,
  INDEX `costDriverId_fk_idx` (`costDriverId` ASC) VISIBLE,
  INDEX `SDMId_fk_idx` (`SDMId` ASC) VISIBLE,
  INDEX `ITVMId_fk_idx` (`ITVMId` ASC) VISIBLE,
  INDEX `budgetTypeId_fk_idx` (`budgetTypeId` ASC) VISIBLE,
  INDEX `stakeholderId_fk_idx` (`stakeholderId` ASC) VISIBLE,
  INDEX `billingSystemId_fk_idx` (`billingSystemId` ASC) VISIBLE,
  CONSTRAINT `vendorId_fk`
    FOREIGN KEY (`vendorId`)
    REFERENCES `contractdb`.`vendors` (`vendorId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `domainId_fk`
    FOREIGN KEY (`domainId`)
    REFERENCES `contractdb`.`domains` (`domainId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `itvmCategoryId_fk`
    FOREIGN KEY (`itvmCategoryId`)
    REFERENCES `contractdb`.`ITVMCategories` (`ITVMCategoryId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `costDriverId_fk`
    FOREIGN KEY (`costDriverId`)
    REFERENCES `contractdb`.`costDrivers` (`costDriverId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `SDMId_fk`
    FOREIGN KEY (`SDMId`)
    REFERENCES `contractdb`.`SDMers` (`SDMId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `ITVMId_fk`
    FOREIGN KEY (`ITVMId`)
    REFERENCES `contractdb`.`ITVMers` (`ITVMId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `stakeholderId_fk`
    FOREIGN KEY (`stakeholderId`)
    REFERENCES `contractdb`.`stakeholders` (`StakeholderId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `budgetTypeId_fk`
    FOREIGN KEY (`budgetTypeId`)
    REFERENCES `contractdb`.`budgetType` (`budgetTypeId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `billingSystemId_fk`
    FOREIGN KEY (`billingSystemId`)
    REFERENCES `contractdb`.`billingSystems` (`billingSystemId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`forecasts`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`forecasts` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`forecasts` (
  `forecastId` INT NOT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `dateStart` DATE NULL DEFAULT NULL,
  `dateEnd` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`forecastId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `contractdb`.`contractForecast`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`contractForecast` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`contractForecast` (
  `contractForecastId` INT NOT NULL AUTO_INCREMENT,
  `forecastId` INT NOT NULL,
  `contractId` INT NOT NULL,
  `OPEX` INT NULL,
  `CAPEX` INT NULL,
  PRIMARY KEY (`contractForecastId`),
  INDEX `forecastId_fk_idx` (`forecastId` ASC) VISIBLE,
  INDEX `contractId_fk_idx` (`contractId` ASC) VISIBLE,
  CONSTRAINT `forecastId_fk`
    FOREIGN KEY (`forecastId`)
    REFERENCES `contractdb`.`forecasts` (`forecastId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `contractId_fk`
    FOREIGN KEY (`contractId`)
    REFERENCES `contractdb`.`contracts` (`ContractId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `contractdb`.`contractForecastRemarks`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contractdb`.`contractForecastRemarks` ;

CREATE TABLE IF NOT EXISTS `contractdb`.`contractForecastRemarks` (
  `contractForecastRemarkId` INT NOT NULL,
  `contractForecastId` INT NOT NULL,
  `remark` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`contractForecastRemarkId`),
  INDEX `contractForecastId_fk_idx` (`contractForecastId` ASC) VISIBLE,
  CONSTRAINT `contractForecastId_fk`
    FOREIGN KEY (`contractForecastId`)
    REFERENCES `contractdb`.`contractForecast` (`contractForecastId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
