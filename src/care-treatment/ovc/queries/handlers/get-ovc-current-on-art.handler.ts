import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOvcCurrentOnArtQuery } from '../impl/get-ovc-current-on-art.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransOvcEnrollments } from '../../entities/fact-trans-ovc-enrollments.model';
import { Repository } from 'typeorm';
import { FactTransOtzOutcome } from '../../../otz/entities/fact-trans-otz-outcome.model';

@QueryHandler(GetOvcCurrentOnArtQuery)
export class GetOvcCurrentOnArtHandler implements IQueryHandler<GetOvcCurrentOnArtQuery> {
    constructor(
        @InjectRepository(FactTransOvcEnrollments, 'mssql')
        private readonly repository: Repository<FactTransOtzOutcome>
    ) {
    }

    async execute(query: GetOvcCurrentOnArtQuery): Promise<any> {
        const ovcCurrentOnART = this.repository.createQueryBuilder('f')
            .select(['Count (*)ovcCurrentOnART'])
            .andWhere('f.OVCEnrollmentDate IS NOT NULL and f.TXCurr=1');

        if (query.county) {
            ovcCurrentOnART.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            ovcCurrentOnART.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            ovcCurrentOnART.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            ovcCurrentOnART.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        if (query.agency) {
            ovcCurrentOnART.andWhere('f.CTAgency IN (:...agencies)', { agencies: query.agency });
        }

        if (query.gender) {
            ovcCurrentOnART.andWhere('f.Gender IN (:...genders)', { genders: query.gender });
        }

        if (query.datimAgeGroup) {
            ovcCurrentOnART.andWhere('f.DATIM_AgeGroup IN (:...ageGroups)', { ageGroups: query.datimAgeGroup });
        }

        return await ovcCurrentOnART.getRawOne();
    }
}
