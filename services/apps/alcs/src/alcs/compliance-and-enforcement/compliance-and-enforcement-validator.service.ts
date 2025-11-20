import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable, Logger } from '@nestjs/common';
import { ComplianceAndEnforcement } from './compliance-and-enforcement.entity';
import { ComplianceAndEnforcementSubmitterDto } from './submitter/submitter.dto';
import { ComplianceAndEnforcementPropertyDto } from './property/property.dto';
import { ComplianceAndEnforcementResponsibleParty } from './responsible-parties/responsible-party.entity';
import { ComplianceAndEnforcementResponsiblePartyDirector } from './responsible-parties/responsible-party-director.entity';
import { InitialSubmissionType } from './compliance-and-enforcement.entity';

export class ValidatedComplianceAndEnforcement extends ComplianceAndEnforcement {
  // This class represents a validated C&E submission that can be submitted
}

@Injectable()
export class ComplianceAndEnforcementValidatorService {
  private logger: Logger = new Logger(
    ComplianceAndEnforcementValidatorService.name,
  );

  async validateSubmission(
    complianceAndEnforcement: ComplianceAndEnforcement,
    submitters: ComplianceAndEnforcementSubmitterDto[],
    properties: ComplianceAndEnforcementPropertyDto[],
    responsibleParties: ComplianceAndEnforcementResponsibleParty[],
  ) {
    const errors: Error[] = [];

    // Validate main C&E file
    await this.validateMainFile(complianceAndEnforcement, errors);

    // Validate submitters
    await this.validateSubmitters(complianceAndEnforcement, submitters, errors);

    // Validate properties
    await this.validateProperties(properties, errors);

    // Validate responsible parties
    await this.validateResponsibleParties(responsibleParties, properties, errors);

    return {
      errors,
      validatedSubmission:
        errors.length === 0
          ? (complianceAndEnforcement as ValidatedComplianceAndEnforcement)
          : undefined,
    };
  }

  private async validateMainFile(
    complianceAndEnforcement: ComplianceAndEnforcement,
    errors: Error[],
  ) {
    // Validate initial submission type
    if (!complianceAndEnforcement.initialSubmissionType) {
      errors.push(
        new ServiceValidationException('Initial submission type is required'),
      );
    }

    // Validate alleged contravention narrative
    if (!complianceAndEnforcement.allegedContraventionNarrative?.trim()) {
      errors.push(
        new ServiceValidationException('Alleged contravention narrative is required'),
      );
    }

    // Validate alleged activities
    if (!complianceAndEnforcement.allegedActivity || complianceAndEnforcement.allegedActivity.length === 0) {
      errors.push(
        new ServiceValidationException('At least one alleged activity must be selected'),
      );
    }

  }

  private async validateSubmitters(
    complianceAndEnforcement: ComplianceAndEnforcement,
    submitters: ComplianceAndEnforcementSubmitterDto[],
    errors: Error[],
  ) {
    // If submission type is referral, affiliation (submitters) is required
    if (complianceAndEnforcement.initialSubmissionType === InitialSubmissionType.REFERRAL && (!submitters || submitters.length === 0)) {
      errors.push(
        new ServiceValidationException('Affiliation is required for referral submissions'),
      );
      return;
    }

    // For other submission types, submitters are optional (need to double check this)
    return;
  }

  private async validateProperties(
    properties: ComplianceAndEnforcementPropertyDto[],
    errors: Error[],
  ) {
    if (!properties || properties.length === 0) {
      errors.push(
        new ServiceValidationException('At least one property is required'),
      );
      return;
    }

    for (const property of properties) {
      // Validate civic address
      if (!property.civicAddress?.trim()) {
        errors.push(
          new ServiceValidationException('Property civic address is required'),
        );
      }

      // Validate legal description
      if (!property.legalDescription?.trim()) {
        errors.push(
          new ServiceValidationException('Property legal description is required'),
        );
      }

      // Validate local government
      if (!property.localGovernmentUuid) {
        errors.push(
          new ServiceValidationException('Property local government is required'),
        );
      }

      // Validate area hectares
      if (!property.areaHectares || property.areaHectares <= 0) {
        errors.push(
          new ServiceValidationException('Property area hectares must be greater than 0'),
        );
      }

      // Validate ALR percentage
      if (property.alrPercentage < 0 || property.alrPercentage > 100) {
        errors.push(
          new ServiceValidationException('Property ALR percentage must be between 0 and 100'),
        );
      }

      // Validate ownership type specific requirements
      if (property.ownershipTypeCode === 'SMPL' && !property.pid?.trim()) {
        errors.push(
          new ServiceValidationException('Fee Simple properties must have a PID'),
        );
      }

      if (property.pid && property.pid.length !== 9) {
        errors.push(
          new ServiceValidationException('Property PID must be exactly 9 characters'),
        );
      }

      if (property.pin && property.pin.length !== 9) {
        errors.push(
          new ServiceValidationException('Property PIN must be exactly 9 characters'),
        );
      }
    }
  }

  private async validateResponsibleParties(
    responsibleParties: ComplianceAndEnforcementResponsibleParty[],
    properties: ComplianceAndEnforcementPropertyDto[],
    errors: Error[],
  ) {
    
    const isCrownProperty = properties.some(property => property.ownershipTypeCode === 'CRWN');

    if (!isCrownProperty && (!responsibleParties || responsibleParties.length === 0)) {
      errors.push(
        new ServiceValidationException('At least one responsible party is required'),
      );
      return;
    }
    
    if (!responsibleParties || responsibleParties.length === 0) {
      return;
    }

    for (const party of responsibleParties) {
      // Validate party type
      if (!party.partyType) {
        errors.push(
          new ServiceValidationException('Responsible party type is required'),
        );
      }

      // Validate FOIPPA category
      if (!party.foippaCategory) {
        errors.push(
          new ServiceValidationException('Responsible party FOIPPA category is required'),
        );
      }

      // Validate based on FOIPPA category - but make contact details optional
      if (party.foippaCategory === 'Individual') {
        if (!party.individualName?.trim()) {
          errors.push(
            new ServiceValidationException('Individual name is required for individual responsible parties'),
          );
        }

        if (!party.individualMailingAddress?.trim()) {
          errors.push(
            new ServiceValidationException('Individual mailing address is required for individual responsible parties'),
          );
        }

        // Individual telephone and email are optional
      } else if (party.foippaCategory === 'Organization') {
        if (!party.organizationName?.trim()) {
          errors.push(
            new ServiceValidationException('Organization name is required for organization responsible parties'),
          );
        }

        // Organization telephone and email are optional

        // Validate directors for organizations
        if (party.directors && party.directors.length > 0) {
          for (const director of party.directors) {
            if (!director.directorName?.trim()) {
              errors.push(
                new ServiceValidationException('Director name is required for organization directors'),
              );
            }

            if (!director.directorMailingAddress?.trim()) {
              errors.push(
                new ServiceValidationException('Director mailing address is required for organization directors'),
              );
            }
          }
        }
      }

      // Validate property owner specific fields
      if (party.partyType === 'Property Owner' && !party.ownerSince) {
        errors.push(
          new ServiceValidationException('Owner since date is required for property owners'),
        );
      }
    }
  }
}
