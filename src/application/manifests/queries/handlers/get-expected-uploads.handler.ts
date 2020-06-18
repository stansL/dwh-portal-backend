import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FactManifest } from '../../../../entities/manifests/fact-manifest.entity';
import { GetExpectedUploadsQuery } from '../get-expected-uploads.query';
import { ExpectedUploadsTileDto } from '../../../../entities/manifests/dtos/expected-uploads-tile.dto';


@QueryHandler(GetExpectedUploadsQuery)
export class GetExpectedUploadsHandler implements IQueryHandler<GetExpectedUploadsQuery> {

    constructor(
        @InjectRepository(FactManifest)
        private readonly repository: Repository<FactManifest>,
    ) {
    }

    async execute(query: GetExpectedUploadsQuery): Promise<ExpectedUploadsTileDto> {
        const params = [query.docket];
        let expectedSql = 'select sum(expected) as totalexpected from expected_uploads where docket=?';
        if (query.county) {
            expectedSql = `${expectedSql} and county=?`;
            params.push(query.county);
        }
        if (query.agency) {
            expectedSql = `${expectedSql} and agency=?`;
            params.push(query.agency);
        }
        if (query.partner) {
            expectedSql = `${expectedSql} and partner=?`;
            params.push(query.partner);
        }
        const expectedResult = await this.repository.query(expectedSql, params);
        return new ExpectedUploadsTileDto(query.docket,+expectedResult[0].totalexpected);
    }
}
