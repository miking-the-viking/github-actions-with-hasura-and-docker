import { PasswordService } from './password.service';

describe('Password Service', () => {
    const ORIGINAL = 'somePassw0Rd';
    let hashed: string;
    let passwordService: PasswordService;

    beforeAll(() => {
        passwordService = new PasswordService();
    });

    it('Can hash a password', async () => {
        hashed = await passwordService.hashPassword(ORIGINAL);
        expect(hashed.length).toBeGreaterThan(0);
    });

    it('Can validate a valid password from the hashed one', async () => {
        const isGood = await passwordService.validatePassword(ORIGINAL, hashed);
        expect(isGood).toBeTruthy();
    });

    it('Can validate an invalid password from the hashed one', async () => {
        const isGood = await passwordService.validatePassword(
            ORIGINAL + 'somethingelse',
            hashed
        );
        expect(isGood).toBeFalsy();
    });
});
