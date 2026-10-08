import { describe,it,expect } from 'vitest';
import { validatePack } from '../../src/content/validate';
import { blueprint,question,pack } from '../fixtures';
describe('question evidence contracts',()=>{
 it('accepts a structured draft',()=>expect(validatePack(pack(),blueprint).issues).toEqual([]));
 it('rejects_missing_option_evidence',()=>{const q=question();q.options[0].referenceIds=[];expect(validatePack(pack([q]),blueprint).issues.some(x=>x.path.includes('referenceIds'))).toBe(true)});
 it('rejects_count_mismatch',()=>expect(validatePack(pack([question({correctOptionIds:['a','b']})]),blueprint).pack).toBeNull());
 it('rejects_duplicate_identity',()=>expect(validatePack(pack([question(),question()]),blueprint).pack).toBeNull());
 it('rejects_unknown_objective',()=>expect(validatePack(pack([question({objectiveId:'missing'})]),blueprint).pack).toBeNull());
 it('rejects_extra_fields_and_oversized_text',()=>{expect(validatePack(pack([question({prompt:'x'.repeat(4001)})]),blueprint).pack).toBeNull();expect(validatePack(pack([question({html:'<script>'})]),blueprint).pack).toBeNull()});
 it('rejects_deceptive_host',()=>{for(const url of ['https://learn.microsoft.com.example.org/x','https://someone@learn.microsoft.com/x','http://learn.microsoft.com/x']){const q=question();q.references[0].url=url;expect(validatePack(pack([q]),blueprint).pack).toBeNull()}});
 it('rejects unknown correct IDs and references',()=>{expect(validatePack(pack([question({correctOptionIds:['missing']})]),blueprint).pack).toBeNull();const q=question();q.options[0].referenceIds=['missing'];expect(validatePack(pack([q]),blueprint).pack).toBeNull()});
});
