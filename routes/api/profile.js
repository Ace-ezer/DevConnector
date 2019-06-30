const express = require('express') ;
const router = express.Router() ;

const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

const request = require('request');
const  config = require('config');

const { check , validationResult } = require('express-validator');

// @route GET api/profile/me
// @descr. Get Current users Profile
// @access Private
router.get( '/me' , auth , async (req , res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user' , ['name' , 'avatar']);

        if( !profile )
        {
            return res.status(400).json({ msg: 'No such profile exists' });
        }

        res.json(profile);
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route POST api/profile
// @descr. Create or Update users Profile
// @access Private
router.post('/' , 
    [ 
        auth , [
        check('status' , 'Status is required').not().isEmpty(),
        check('skills' , 'skills are required').not().isEmpty()
        ]
    ],
    async (req , res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body ;

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id ;
        if(company) profileFields.company = company ;
        if(website) profileFields.website = website ;
        if(location) profileFields.location = location ;
        if(bio) profileFields.bio = bio ;
        if(status) profileFields.status = status ;
        if(githubusername) profileFields.githubusername = githubusername ;
        if(skills)
        {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        
        //Build social object
        profileFields.social = {};
        if(youtube) profileFields.social.youtube = youtube ;
        if(twitter) profileFields.social.twitter = twitter ;
        if(facebook) profileFields.social.facebook = facebook ;
        if(linkedin) profileFields.social.linkedin = linkedin ;
        if(instagram) profileFields.social.instagram = instagram ;

        try
        {
            let profile = await Profile.findOne({ user: req.user.id });

            if(profile) {
                //Update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id } , 
                    { $set: profileFields } ,
                    { new : true} 
                    );
                    return res.json(profile) ;    
            }
            
            // Create
            profile = new Profile(profileFields);
            await profile.save();

            res.json(profile);
        }
        catch(err)
        {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

// @route GET api/profile
// @descr. Get all users Profile
// @access Public
router.get('/' , async (req , res) => {
    try {
        const profiles = await Profile.find().populate('user' , [ 'name' , 'avatar' ]);
        res.send(profiles);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route GET api/profile/user/:user_id
// @descr. Get Profile by user ID
// @access Public
router.get('/user/:user_id' , async (req , res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user' , [ 'name' , 'avatar' ]);

        if(!profile)
            return res.status(400).json({ msg: 'Profile not found'});

        res.send(profile);
    } catch (err) {
        console.log(err.message);
        if(err.kind == 'ObjectId')
            return res.status(400).json({ msg: 'Profile not found'});
        res.status(500).send('Server Error');
    }
});

// @route DELETE api/profile
// @descr. Delete Profile, user & posts
// @access Private
router.delete('/' , auth , async (req , res) => {
    try {
        //Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //Remove user
        await User.findOneAndRemove({ _id: req.user.id });

        res.send({ msg: 'User deleted' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route Put api/profile/experience
// @descr. Add Profile Experience
// @access Private
router.put( '/experience' ,
     [ 
         auth , 
         [
            check('title' , 'Title is required').not().isEmpty(),
            check('company' , 'Company is required').not().isEmpty(),
            check('from' , 'From date is required').not().isEmpty()
         ]] ,
        async (req ,res) => {
            const errors = validationResult(req);
            if(!errors.isEmpty())
            {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                title ,
                company,
                location,
                from,
                to, 
                current,
                description
            } = req.body ;

            const newExp = {
                title ,
                company,
                location,
                from,
                to, 
                current,
                description
            }

            try {
                const profile = await Profile.findOne({ user: req.user.id});

                profile.experience.unshift(newExp);
                await profile.save();

                res.json(profile);

            } catch (err) {
                console.log(err.message);
                res.status(500).send('Server Error');
            }
});

// @route Delete api/profile/experience/:exp_id
// @descr. Delete experience from profile
// @access Private
router.delete( '/experience/:exp_id' , auth , async (req , res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //Get Remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        
        profile.experience.splice( removeIndex , 1 );

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route Put api/profile/education
// @descr. Add Profile Education
// @access Private
router.put( '/education' ,
     [ 
         auth , 
         [
            check('school' , 'School is required').not().isEmpty(),
            check('degree' , 'Degree is required').not().isEmpty(),
            check('fieldofstudy' , 'Field of study is required').not().isEmpty(),
            check('from' , 'From date is required').not().isEmpty()
         ]] ,
        async (req ,res) => {
            const errors = validationResult(req);
            if(!errors.isEmpty())
            {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                school ,
                degree,
                fieldofstudy,
                from,
                to, 
                current,
                description
            } = req.body ;

            const newEdu = {
                school ,
                degree,
                fieldofstudy,
                from,
                to, 
                current,
                description
            }

            try {
                const profile = await Profile.findOne({ user: req.user.id});

                profile.education.unshift(newEdu);
                await profile.save();

                res.json(profile);

            } catch (err) {
                console.log(err.message);
                res.status(500).send('Server Error');
            }
});

// @route Delete api/profile/education/:edu_id
// @descr. Delete education from profile
// @access Private
router.delete( '/education/:edu_id' , auth , async (req , res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //Get Remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        
        profile.education.splice( removeIndex , 1 );

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});


// @route GET api/profile/github/:username
// @descr. Get user repos from GitHub
// @access Public
router.get( '/github/:username' , async (req , res) => {
    try {
        
        const options = {
            uri: 'https://api.github.com/users/'+req.params.username+'/repos?per_page=5&sort=created:asc&client_id='+config.get('githubClientId')+'&client_secret='+config.get('githubSecret')+'',
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };

        request(options , (error , response ,body) => {
            if(error)
                console.log(error);
            
            if(response.statusCode != 200){
                return res.status(404).json({ msg: 'Not Found!' });
            }

            res.json(JSON.parse(body));
        });

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router ;